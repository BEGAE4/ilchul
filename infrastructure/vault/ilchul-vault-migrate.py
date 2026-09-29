#!/usr/bin/env python3
"""Install root:root 0750 as /usr/local/sbin/ilchul-vault-migrate after review.

No account provisioning, policy changes, shared-service restarts or secret fallback.
The common host publisher must support the separate ilchul-migration profile first.
"""
import datetime
import fcntl
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import selectors
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import uuid

SECRET_ROOT = Path('/run/oci-service-secrets/ilchul-migration')
BACKUP_ROOT = Path('/var/backups/ilchul-vault')


def validate_image(image):
    if not re.fullmatch(r'ghcr\.io/begae4/ilchul-backend:[0-9a-f]{40}', image):
        raise ValueError()


def restricted_args(name):
    return ['docker', 'run', '--rm', '--name', name, '--network=shared-infra', '--user=0:0',
            '--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--log-driver=none',
            '--pids-limit=128', '--memory=768m', '--cpus=1', '--ulimit=core=0',
            '--tmpfs=/tmp:rw,noexec,nosuid,nodev,size=128m,mode=1777']


def migration_args(image, name):
    validate_image(image)
    return restricted_args(name) + ['--mount', f'type=bind,src={SECRET_ROOT},dst={SECRET_ROOT},readonly',
                                   '--entrypoint=java', image, '-jar', '/app/app.jar', '--ilchul-migrate']


def mysql_options(values):
    if set(values) != {'MYSQL_USER', 'MYSQL_PASSWORD'}:
        raise ValueError()
    def quote(value):
        if not isinstance(value, str) or not value or any(c in value for c in '\n\r\0'):
            raise ValueError()
        return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'
    return '[client]\nhost=mysql\nport=3306\nuser=' + quote(values['MYSQL_USER']) + '\npassword=' + quote(values['MYSQL_PASSWORD']) + '\n'


def command(args, **kwargs):
    return subprocess.run(args, check=True, stderr=subprocess.DEVNULL, timeout=600, **kwargs)


def remove_container(name, execute=command):
    # A daemon error is not evidence that a container is absent: preserve its mount on uncertainty.
    result = execute(['docker', 'container', 'ls', '-a', '--filter', 'name=^/' + name + '$',
                      '--format', '{{.Names}}'], stdout=subprocess.PIPE, text=True)
    if result.stdout.strip():
        if result.stdout.strip() != name:
            raise ValueError()
        execute(['docker', 'rm', '-f', name], stdout=subprocess.DEVNULL)


def require_no_previous_jobs(execute=command):
    result = execute(['docker', 'container', 'ls', '-a', '--filter', 'name=^/ilchul-(backup|migrate)-',
                      '--format', '{{.Names}}'], stdout=subprocess.PIPE, text=True)
    if result.stdout.strip():
        raise ValueError()


def read_migration_values():
    info = SECRET_ROOT.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != 0 or info.st_gid != 0 or stat.S_IMODE(info.st_mode) != 0o750:
        raise ValueError()
    link = SECRET_ROOT / 'current'
    if not link.is_symlink() or link.lstat().st_uid != 0:
        raise ValueError()
    target = os.readlink(link)
    if not re.fullmatch(r'g-[A-Za-z0-9]{6}', target):
        raise ValueError()
    generation = SECRET_ROOT / target
    info = generation.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != 0 or info.st_gid != 0 or stat.S_IMODE(info.st_mode) != 0o750:
        raise ValueError()
    fd = os.open(generation / 'CONFIG_JSON', os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or info.st_gid != 0 or stat.S_IMODE(info.st_mode) != 0o640 or info.st_nlink != 1 or not 0 < info.st_size <= 65536:
            raise ValueError()
        values = json.loads(os.read(fd, 65537))
        mysql_options(values)
        return values
    finally:
        os.close(fd)


def backup(options_dir, name):
    # Use the running MySQL image, never an unpinned/mismatched client download.
    image = command(['docker', 'inspect', '--format', '{{.Config.Image}}', 'mysql'], stdout=subprocess.PIPE, text=True).stdout.strip()
    if not re.fullmatch(r'(?:docker\.io/library/)?mysql(?::[A-Za-z0-9_.-]+)?@sha256:[0-9a-f]{64}', image):
        raise ValueError()
    BACKUP_ROOT.mkdir(mode=0o700, exist_ok=True)
    info = BACKUP_ROOT.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != 0 or stat.S_IMODE(info.st_mode) != 0o700:
        raise ValueError()
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    destination = BACKUP_ROOT / (stamp + '.sql.gz')
    args = restricted_args(name) + ['--mount', f'type=bind,src={options_dir},dst=/run/ilchul-backup,readonly',
        '--entrypoint=mysqldump', image, '--defaults-extra-file=/run/ilchul-backup/client.cnf',
        '--single-transaction', '--quick', '--no-tablespaces', '--set-gtid-purged=OFF',
        '--routines', '--events', '--triggers', 'ilchul_db']
    with destination.open('xb') as raw:
        with gzip.GzipFile(fileobj=raw, mode='wb') as compressed:
            with subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL) as process:
                try:
                    with selectors.DefaultSelector() as selector:
                        selector.register(process.stdout, selectors.EVENT_READ)
                        deadline = time.monotonic() + 1800
                        while True:
                            if time.monotonic() > deadline:
                                raise TimeoutError()
                            if not selector.select(timeout=1):
                                continue
                            chunk = os.read(process.stdout.fileno(), 1024 * 1024)
                            if not chunk:
                                break
                            compressed.write(chunk)
                    if process.wait(timeout=30) != 0:
                        raise ValueError()
                finally:
                    if process.poll() is None:
                        process.kill()
                        process.wait()
        raw.flush()
        os.fsync(raw.fileno())
    # Read to EOF to validate CRC; record digest only after a successful dump and gzip verification.
    size = 0
    with gzip.open(destination, 'rb') as source:
        while chunk := source.read(1024 * 1024):
            size += len(chunk)
    if size < 100:
        raise ValueError()
    digest = hashlib.sha256()
    with destination.open('rb') as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    with destination.with_suffix('.sha256').open('x') as record:
        record.write(digest.hexdigest() + '  ' + destination.name + '\n')


def main(image):
    validate_image(image)
    if os.geteuid() != 0:
        raise ValueError()
    os.umask(0o077)
    command(['/usr/local/sbin/ilchul-vault-preflight'], stdout=subprocess.DEVNULL)
    lock_fd = os.open('/run/lock/ilchul-vault-migration.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(lock_fd, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        require_no_previous_jobs()
        suffix = uuid.uuid4().hex[:12]
        names = ['ilchul-backup-' + suffix, 'ilchul-migrate-' + suffix]
        try:
            command(['/opt/node24/bin/node', '/opt/project-management-runtime/current/ops/oci-runtime/vault-runtime.mjs',
                     '--ilchul-migration'], stdout=subprocess.DEVNULL)
            options = mysql_options(read_migration_values())
            options_dir = Path(tempfile.mkdtemp(prefix='backup-', dir=SECRET_ROOT))
            (options_dir / 'client.cnf').write_text(options)
            backup(options_dir, names[0])
            command(migration_args(image, names[1]), stdout=subprocess.DEVNULL)
        finally:
            # An error here intentionally leaves root-only files for operator inspection.
            for name in names:
                remove_container(name)
            if SECRET_ROOT.exists():
                if SECRET_ROOT.is_symlink():
                    raise ValueError()
                shutil.rmtree(SECRET_ROOT)


if __name__ == '__main__':
    try:
        if len(sys.argv) != 2:
            raise ValueError()
        main(sys.argv[1])
        print('ILCHUL_HOST_MIGRATION_OK')
    except Exception:
        print('ILCHUL_HOST_MIGRATION_FAILED', file=sys.stderr)
        sys.exit(1)

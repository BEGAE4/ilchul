#!/usr/bin/env python3
"""Guard and record Ilchul blue/green deployment attempts.

Install as root:root 0750 at /usr/local/sbin/ilchul-vault-deployment.
The pending state and its archive contain only immutable image SHAs, workflow IDs,
colors, and verification metadata. No runtime secrets are read or recorded here.
"""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import NamedTuple
import uuid


PROJECT_ROOT = Path('/home/begae/ilchul')
STATE_ROOT = Path('/var/lib/ilchul-vault')
ARCHIVE_ROOT = Path('/var/backups/ilchul-vault/deployment-acceptance')
PENDING_NAME = 'vault-acceptance-pending.json'
LEGACY_PENDING = PROJECT_ROOT / PENDING_NAME
LOCK_PATH = Path('/run/lock/ilchul-vault-deployment.lock')
COLORS = frozenset({'blue', 'green'})
SHA_PATTERN = re.compile(r'[0-9a-f]{40}')
RUN_ID_PATTERN = re.compile(r'[1-9][0-9]{0,31}')


class HostEvidence(NamedTuple):
    current_color: str
    active_color: str
    healthy_colors: frozenset
    backend_shas: dict
    frontend_shas: dict
    smoke_ok: bool
    migration_jobs_absent: bool


def validate_sha(value):
    if not isinstance(value, str) or not SHA_PATTERN.fullmatch(value):
        raise ValueError()


def validate_run_id(value):
    if not isinstance(value, str) or not RUN_ID_PATTERN.fullmatch(value):
        raise ValueError()


def other_color(color):
    if color == 'blue':
        return 'green'
    if color == 'green':
        return 'blue'
    raise ValueError()


def validate_marker(value):
    if not isinstance(value, dict):
        raise ValueError()
    legacy = set(value) == {'sha', 'previous', 'target'}
    current = set(value) == {'schemaVersion', 'sha', 'runId', 'previous', 'target', 'status'}
    if not legacy and not current:
        raise ValueError()
    validate_sha(value['sha'])
    if value['previous'] not in COLORS or value['target'] != other_color(value['previous']):
        raise ValueError()
    if current:
        if value['schemaVersion'] != 2 or value['status'] != 'pending':
            raise ValueError()
        validate_run_id(value['runId'])
    return value


def validate_evidence(value):
    if value.current_color not in COLORS or value.active_color not in COLORS:
        raise ValueError()
    if value.current_color != value.active_color:
        raise ValueError()
    if value.current_color not in value.healthy_colors:
        raise ValueError()
    if value.smoke_ok is not True or value.migration_jobs_absent is not True:
        raise ValueError()
    for images in (value.backend_shas, value.frontend_shas):
        validate_sha(images.get(value.current_color))


def require_live_sha(evidence, color, sha):
    if evidence.backend_shas.get(color) != sha or evidence.frontend_shas.get(color) != sha:
        raise ValueError()


def prepare_deployment(project_root, state_root, archive_root, sha, run_id, evidence):
    project_root = Path(project_root)
    state_root = Path(state_root)
    archive_root = Path(archive_root)
    validate_sha(sha)
    validate_run_id(run_id)
    validate_evidence(evidence)
    validate_project_root(project_root)
    ensure_private_directory(state_root)
    ensure_private_directory(archive_root)

    pending = state_root / PENDING_NAME
    legacy = project_root / PENDING_NAME
    pending_present = path_present(pending)
    legacy_present = path_present(legacy)
    if pending_present and legacy_present:
        raise ValueError()

    old_path = pending if pending_present else legacy if legacy_present else None
    old_marker = None
    old_info = None
    resolution = None
    if old_path is not None:
        allowed_owners = {os.geteuid()}
        if old_path == legacy:
            allowed_owners.add(project_root.lstat().st_uid)
        old_marker, old_info = read_marker(old_path, allowed_owners)
        if (old_path == pending and old_marker.get('schemaVersion') == 2
                and old_marker['sha'] == sha and old_marker['runId'] == run_id
                and old_marker['previous'] == evidence.current_color):
            return old_marker
        if evidence.current_color == old_marker['previous']:
            resolution = 'failed-superseded'
        elif evidence.current_color == old_marker['target']:
            require_live_sha(evidence, evidence.current_color, old_marker['sha'])
            resolution = 'accepted-late'
        else:
            raise ValueError()

    new_marker = {
        'schemaVersion': 2,
        'sha': sha,
        'runId': run_id,
        'previous': evidence.current_color,
        'target': other_color(evidence.current_color),
        'status': 'pending',
    }
    if old_marker is not None:
        archive_marker(archive_root, old_marker, resolution, sha, evidence)
        if old_path == legacy:
            unlink_unchanged(old_path, old_info)
    write_json_atomic(pending, new_marker)
    return new_marker


def accept_deployment(state_root, archive_root, sha, evidence):
    state_root = Path(state_root)
    archive_root = Path(archive_root)
    validate_sha(sha)
    validate_evidence(evidence)
    ensure_private_directory(state_root)
    ensure_private_directory(archive_root)
    pending = state_root / PENDING_NAME
    marker, info = read_marker(pending, {os.geteuid()})
    if marker.get('schemaVersion') != 2 or marker['sha'] != sha:
        raise ValueError()
    if evidence.current_color != marker['target']:
        raise ValueError()
    require_live_sha(evidence, marker['target'], sha)
    archive_marker(archive_root, marker, 'accepted', None, evidence)
    unlink_unchanged(pending, info)


def path_present(path):
    return path.exists() or path.is_symlink()


def validate_project_root(path):
    info = Path(path).lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_mode & 0o022:
        raise ValueError()
    return info


def ensure_private_directory(path):
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    info = path.lstat()
    if (not stat.S_ISDIR(info.st_mode) or info.st_uid != os.geteuid()
            or stat.S_IMODE(info.st_mode) != 0o700):
        raise ValueError()


def read_marker(path, allowed_owners):
    raw, info = read_small_file(path, allowed_owners, {0o600})
    marker = validate_marker(json.loads(raw.decode('utf-8', errors='strict')))
    return marker, info


def read_small_file(path, allowed_owners, allowed_modes):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        info = os.fstat(fd)
        if (not stat.S_ISREG(info.st_mode) or info.st_uid not in allowed_owners
                or stat.S_IMODE(info.st_mode) not in allowed_modes or info.st_nlink != 1
                or not 0 < info.st_size <= 65536):
            raise ValueError()
        raw = os.read(fd, 65537)
        if len(raw) != info.st_size or b'\0' in raw:
            raise ValueError()
        return raw, info
    finally:
        os.close(fd)


def write_json_atomic(path, value):
    payload = (json.dumps(value, sort_keys=True, separators=(',', ':')) + '\n').encode()
    temporary = path.parent / ('.' + path.name + '.' + uuid.uuid4().hex + '.tmp')
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, 'wb', closefd=False) as output:
            output.write(payload)
            output.flush()
            os.fsync(output.fileno())
    finally:
        os.close(fd)
    try:
        os.replace(temporary, path)
        fsync_directory(path.parent)
    finally:
        if temporary.exists():
            temporary.unlink()


def archive_marker(archive_root, marker, resolution, superseded_by, evidence):
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    record = {
        'schemaVersion': 1,
        'resolvedAt': stamp,
        'resolution': resolution,
        'supersededBy': superseded_by,
        'marker': marker,
        'verification': {
            'currentColor': evidence.current_color,
            'activeColor': evidence.active_color,
            'healthyColors': sorted(evidence.healthy_colors),
            'backendSha': evidence.backend_shas[evidence.current_color],
            'frontendSha': evidence.frontend_shas[evidence.current_color],
            'smokeOk': evidence.smoke_ok,
            'migrationJobsAbsent': evidence.migration_jobs_absent,
        },
    }
    name = stamp + '-' + resolution + '-' + marker['sha'] + '.json'
    path = archive_root / name
    payload = (json.dumps(record, sort_keys=True, separators=(',', ':')) + '\n').encode()
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    try:
        with os.fdopen(fd, 'wb', closefd=False) as output:
            output.write(payload)
            output.flush()
            os.fsync(output.fileno())
    finally:
        os.close(fd)
    fsync_directory(archive_root)


def unlink_unchanged(path, expected):
    current = path.lstat()
    if (current.st_dev, current.st_ino) != (expected.st_dev, expected.st_ino):
        raise ValueError()
    path.unlink()
    fsync_directory(path.parent)


def fsync_directory(path):
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def inspect_host(project_root=PROJECT_ROOT):
    project_root = Path(project_root)
    project_owner = validate_project_root(project_root).st_uid
    current = read_color_file(project_root / 'current_environment.txt', {0, project_owner})
    active = detect_active_color(project_root, {0, project_owner})
    containers = docker_containers()
    nginx = containers.get('ilchul-nginx')
    if not container_healthy(nginx):
        raise ValueError()

    healthy = set()
    backend_shas = {}
    frontend_shas = {}
    for color in COLORS:
        backend = containers.get('ilchul-backend-' + color)
        frontend = containers.get('ilchul-frontend-' + color)
        backend_sha = image_sha(backend, 'ghcr.io/begae4/ilchul-backend:')
        frontend_sha = image_sha(frontend, 'ghcr.io/begae4/ilchul-frontend:')
        if backend_sha is not None:
            backend_shas[color] = backend_sha
        if frontend_sha is not None:
            frontend_shas[color] = frontend_sha
        if container_healthy(backend) and container_healthy(frontend):
            healthy.add(color)

    jobs = subprocess.check_output(
        ['docker', 'container', 'ls', '-a', '--format', '{{.Names}}'],
        text=True, stderr=subprocess.DEVNULL, timeout=30).splitlines()
    migration_jobs_absent = not any(
        name.startswith('ilchul-backup-') or name.startswith('ilchul-migrate-') for name in jobs)
    return HostEvidence(
        current_color=current,
        active_color=active,
        healthy_colors=frozenset(healthy),
        backend_shas=backend_shas,
        frontend_shas=frontend_shas,
        smoke_ok=public_smoke_ok(),
        migration_jobs_absent=migration_jobs_absent,
    )


def read_color_file(path, owners):
    raw, _ = read_small_file(path, owners, {0o600, 0o640, 0o644, 0o664})
    value = raw.decode('ascii', errors='strict').strip()
    if value not in COLORS:
        raise ValueError()
    return value


def detect_active_color(project_root, owners):
    active, _ = read_small_file(
        project_root / 'nginx/runtime/active.conf', owners, {0o600, 0o640, 0o644})
    matches = []
    for color in COLORS:
        candidate, _ = read_small_file(
            project_root / ('nginx/upstreams/' + color + '.conf'), owners, {0o600, 0o640, 0o644})
        if hashlib.sha256(active).digest() == hashlib.sha256(candidate).digest():
            matches.append(color)
    if len(matches) != 1:
        raise ValueError()
    return matches[0]


def docker_containers():
    names = ['ilchul-nginx']
    for color in COLORS:
        names.extend(['ilchul-backend-' + color, 'ilchul-frontend-' + color])
    result = subprocess.run(
        ['docker', 'inspect', *names], text=True, capture_output=True, timeout=30)
    values = json.loads(result.stdout or '[]')
    containers = {item.get('Name', '').lstrip('/'): item for item in values}
    if result.returncode not in (0, 1) or 'ilchul-nginx' not in containers:
        raise ValueError()
    return containers


def container_healthy(value):
    if not isinstance(value, dict):
        return False
    state = value.get('State')
    return (isinstance(state, dict) and state.get('Running') is True
            and isinstance(state.get('Health'), dict) and state['Health'].get('Status') == 'healthy')


def image_sha(value, prefix):
    if not isinstance(value, dict) or not isinstance(value.get('Config'), dict):
        return None
    image = value['Config'].get('Image')
    if not isinstance(image, str) or not image.startswith(prefix):
        return None
    sha = image[len(prefix):]
    return sha if SHA_PATTERN.fullmatch(sha) else None


def public_smoke_ok():
    checks = (
        ('https://il-chul.com/intro', '200'),
        ('https://il-chul.com/api/mypage/plans', '401'),
        ('https://il-chul.com/api/region', '200'),
    )
    for url, expected in checks:
        result = subprocess.run(
            ['curl', '--silent', '--show-error', '--output', '/dev/null', '--write-out', '%{http_code}',
             '--connect-timeout', '5', '--max-time', '20', url],
            text=True, capture_output=True, timeout=30)
        if result.returncode != 0 or result.stdout != expected:
            return False
    return True


def command(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)


def main(args):
    if os.geteuid() != 0:
        raise ValueError()
    os.umask(0o077)
    command(['/usr/local/sbin/ilchul-vault-preflight'])
    lock_fd = os.open(LOCK_PATH, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(lock_fd, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        evidence = inspect_host()
        if len(args) == 3 and args[0] == 'prepare':
            prepare_deployment(PROJECT_ROOT, STATE_ROOT, ARCHIVE_ROOT, args[1], args[2], evidence)
            print('ILCHUL_DEPLOYMENT_PREPARED')
            return
        if len(args) == 2 and args[0] == 'accept':
            accept_deployment(STATE_ROOT, ARCHIVE_ROOT, args[1], evidence)
            print('ILCHUL_DEPLOYMENT_ACCEPTED')
            return
        raise ValueError()


if __name__ == '__main__':
    try:
        main(sys.argv[1:])
    except Exception:
        action = sys.argv[1].upper() if len(sys.argv) > 1 and sys.argv[1] in ('prepare', 'accept') else 'COMMAND'
        print('ILCHUL_DEPLOYMENT_' + action + '_FAILED', file=sys.stderr)
        sys.exit(1)

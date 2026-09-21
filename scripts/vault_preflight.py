#!/usr/bin/env python3
"""Read-only deployment gate. No values or underlying exceptions are printed."""
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys

PUBLIC_FIELDS = frozenset({
    'MYSQL_DRIVER', 'MYSQL_URL', 'MYSQL_DATABASE', 'REDIS_DB', 'ADMIN_USERNAME',
    'BACKEND_SERVER_PORT', 'FRONTEND_SERVER_PORT', 'ILCHUL_SECRET_GID',
    'OAUTH_GOOGLE_CLIENT_ID', 'OAUTH_GOOGLE_REDIRECT_URI', 'OAUTH_KAKAO_REDIRECT_URI',
    'OAUTH_NAVER_CLIENT_ID', 'OAUTH_NAVER_REDIRECT_URI', 'FRONTEND_BASE_URL',
    'STORAGE_ENDPOINT', 'STORAGE_BUCKET_NAME', 'STORAGE_REGION', 'STORAGE_PUBLIC_URL'})
CHECKS = frozenset({'accounts', 'vaultIam', 'publisher', 'bootRecovery', 'metadataBlocked',
                    'backup', 'minioPolicy', 'redisCompatibility', 'rollback', 'productionApproval'})


def validate_public_env(text):
    values = {}
    for line in text.splitlines():
        if not line or line.startswith('#'):
            continue
        name, separator, value = line.partition('=')
        if not separator or name not in PUBLIC_FIELDS or name in values or not re.fullmatch(r'[A-Za-z0-9_:/.,?=&%+@-]+', value):
            raise ValueError()
        values[name] = value
    if set(values) != PUBLIC_FIELDS - {'ADMIN_USERNAME'} and set(values) != PUBLIC_FIELDS:
        raise ValueError()
    fixed = {'MYSQL_DRIVER': 'com.mysql.cj.jdbc.Driver', 'MYSQL_URL': 'mysql:3306',
             'MYSQL_DATABASE': 'ilchul_db', 'REDIS_DB': 'redis', 'BACKEND_SERVER_PORT': '8081',
             'FRONTEND_SERVER_PORT': '3001', 'STORAGE_ENDPOINT': 'http://minio:9000', 'STORAGE_BUCKET_NAME': 'ilchul'}
    if any(values[key] != value for key, value in fixed.items()):
        raise ValueError()
    if not re.fullmatch(r'[1-9][0-9]{2,5}', values['ILCHUL_SECRET_GID']):
        raise ValueError()
    if int(values['ILCHUL_SECRET_GID']) in (1000, 1001, 65533, 65534):
        raise ValueError()
    for name in ('OAUTH_GOOGLE_REDIRECT_URI', 'OAUTH_KAKAO_REDIRECT_URI', 'OAUTH_NAVER_REDIRECT_URI',
                 'FRONTEND_BASE_URL', 'STORAGE_PUBLIC_URL'):
        if not values[name].startswith('https://'):
            raise ValueError()
    return values


def validate_readiness(data):
    if (set(data) != {'contractVersion', 'checks'} or type(data['contractVersion']) is not int
            or data['contractVersion'] != 1 or not isinstance(data['checks'], dict)
            or set(data['checks']) != CHECKS or any(value is not True for value in data['checks'].values())):
        raise ValueError()


def secure_file(path, owner=0, mode=0o600):
    path = Path(path)
    parent = path.parent.lstat()
    if not stat.S_ISDIR(parent.st_mode) or parent.st_uid != owner or parent.st_mode & 0o022:
        raise ValueError()
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        info = os.fstat(fd)
        if (not stat.S_ISREG(info.st_mode) or info.st_uid != owner or stat.S_IMODE(info.st_mode) != mode
                or info.st_nlink != 1 or not 0 < info.st_size <= 65536):
            raise ValueError()
        raw = os.read(fd, 65537)
        if len(raw) != info.st_size or b'\0' in raw:
            raise ValueError()
        return raw.decode('utf-8', errors='strict')
    finally:
        os.close(fd)


def require_closed_rollback_window(path):
    if Path(path).exists() or Path(path).is_symlink():
        raise ValueError()


def check_host(new_deployment=False):
    if os.geteuid() != 0:
        raise ValueError()
    if new_deployment:
        require_closed_rollback_window('/home/begae/ilchul/vault-acceptance-pending.json')
    validate_readiness(json.loads(secure_file('/etc/ilchul/vault-cutover.json')))
    values = validate_public_env(secure_file('/etc/ilchul/runtime-public.env', mode=0o644))
    for executable in ('ilchul-vault-migrate', 'ilchul-vault-preflight'):
        info = Path('/usr/local/sbin', executable).lstat()
        if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or stat.S_IMODE(info.st_mode) != 0o750:
            raise ValueError()
    for args in (['is-active', '--quiet', 'ilchul-secrets.service'], ['is-enabled', '--quiet', 'ilchul-runtime.service']):
        subprocess.run(['systemctl', *args], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if subprocess.check_output(['findmnt', '-n', '-o', 'FSTYPE', '-T', '/run/oci-service-secrets'], text=True).strip() != 'tmpfs':
        raise ValueError()
    if len(Path('/proc/swaps').read_text().splitlines()) != 1:
        raise ValueError()
    root = Path('/run/oci-service-secrets/ilchul-backend')
    info = root.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != 0 or info.st_gid != int(values['ILCHUL_SECRET_GID']) or stat.S_IMODE(info.st_mode) != 0o750:
        raise ValueError()
    link = root / 'current'
    if not link.is_symlink() or link.lstat().st_uid != 0 or not re.fullmatch(r'g-[A-Za-z0-9]{6}', os.readlink(link)):
        raise ValueError()
    # The Java loader validates the entire generation before the target can become healthy.
    for network in ('shared-infra', 'ilchul-network', 'monitoring_net'):
        subprocess.run(['docker', 'network', 'inspect', network], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == '__main__':
    try:
        if sys.argv[1:] not in ([], ['--new-deployment']):
            raise ValueError()
        check_host(new_deployment=sys.argv[1:] == ['--new-deployment'])
        print('ILCHUL_VAULT_PREFLIGHT_OK')
    except Exception:
        print('ILCHUL_VAULT_PREFLIGHT_FAILED', file=sys.stderr)
        sys.exit(1)

"""Run the real image entrypoint with Compose security settings, no network or secrets.

Usage: python3 scripts/test_profiler_image.py IMAGE
The absent Vault mount must be the only expected startup failure, after javaagent initialization.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import uuid
from test_vault_preflight import public_config


def isolated_run(image, service, entrypoint=None, command=()):
    name = 'ilchul-profiler-test-' + uuid.uuid4().hex[:12]
    args = ['docker', 'run', '--rm', '--platform=linux/arm64', '--name', name, '--network=none', '--log-driver=none',
            '--memory=768m', '--cpus=1', '--ulimit=core=0', '--env=ILCHUL_RUNTIME_MODE=vault']
    assert service['read_only'] is True
    args.append('--read-only')
    for cap in service['cap_drop']:
        args.append('--cap-drop=' + cap)
    for option in service['security_opt']:
        args.append('--security-opt=' + option)
    args.append('--pids-limit=' + str(service['pids_limit']))
    for mount in service['tmpfs']:
        args.append('--tmpfs=' + mount)
    if entrypoint:
        args += ['--entrypoint', entrypoint]
    # Intentionally no production environment, bind mounts, published ports or app networks.
    try:
        return subprocess.run([*args, image, *command], capture_output=True, text=True, timeout=90)
    finally:
        state = subprocess.run(['docker', 'ps', '-a', '--filter', 'name=^/' + name + '$',
                                '--format', '{{.Names}}'], capture_output=True, text=True, check=True)
        if state.stdout.strip():
            assert state.stdout.strip() == name
            subprocess.run(['docker', 'rm', '-f', name], capture_output=True, check=True)


def verify(image):
    repository = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory() as directory:
        config = Path(directory) / 'public.env'
        config.write_text(public_config())
        environment = {**os.environ, 'BACKEND_IMAGE': image, 'FRONTEND_IMAGE': image}
        for color in ('blue', 'green'):
            rendered = subprocess.run(['docker', 'compose', '--env-file', str(config), '-f',
                str(repository / ('docker-compose.' + color + '.yml')), 'config', '--format', 'json'],
                capture_output=True, text=True, check=True, env=environment)
            service = json.loads(rendered.stdout)['services']['ilchul-backend-' + color]
            result = isolated_run(image, service)
            output = result.stdout + result.stderr
            assert result.returncode == 1 and 'RUNTIME_SECRET_UNAVAILABLE' in output, (
                color + ': real entrypoint did not reach the fail-closed Vault loader; exit=' + str(result.returncode)
                + '\n' + output[-12000:])
            assert all(text not in output for text in ('UnsatisfiedLinkError', 'FATAL ERROR', 'agent load/premain call failed'))
            # Actual execution checks catch missing noexec, broad exec, wrong ownership and native-loader path drift.
            permissions = isolated_run(image, service, 'sh', ('-ec', '''
                test "$(id -u)" = 1001
                test "$(stat -c '%u:%g:%a' /tmp/spring-pyroscope)" = '1001:1001:700'
                mkdir /tmp/noexec-probe
                cp /bin/busybox /tmp/noexec-probe/busybox
                chmod 700 /tmp/noexec-probe/busybox
                if /tmp/noexec-probe/busybox true 2>/dev/null; then exit 1; fi
                cp /bin/busybox /tmp/spring-pyroscope/busybox
                chmod 700 /tmp/spring-pyroscope/busybox
                /tmp/spring-pyroscope/busybox true
                test ! -w /app
                test ! -e /run/oci-service-secrets/ilchul-backend
            '''))
            assert permissions.returncode == 0, color + ': filesystem execution boundary failed\n' + permissions.stderr
            print(color + ': PROFILER_INITIALIZED_VAULT_FAIL_CLOSED_AND_TMP_NOEXEC_OK', flush=True)


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1].startswith('-'):
        raise SystemExit('Usage: test_profiler_image.py IMAGE')
    verify(sys.argv[1])

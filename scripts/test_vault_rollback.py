import os
from pathlib import Path
import subprocess
import tempfile
import unittest


class RollbackTest(unittest.TestCase):
    def test_stopped_vault_backend_is_not_restarted_with_new_generation(self):
        script = Path(__file__).resolve().parents[1] / 'rollback.sh'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'current_environment.txt').write_text('blue\n')
            (root / 'nginx/runtime').mkdir(parents=True)
            (root / 'nginx/runtime/active.conf').write_text('test-only')
            binary = root / 'docker'
            binary.write_text('''#!/bin/sh
printf '%s\\n' "$*" >> "$TEST_COMMANDS"
case "$*" in
  *'State.Running'*) echo false;;
  *'Mounts'*) echo /run/oci-service-secrets/ilchul-backend;;
esac
''')
            binary.chmod(0o700)
            record = root / 'commands'
            result = subprocess.run(['bash', str(script)], input='yes\n', text=True, capture_output=True,
                env={**os.environ, 'PATH': str(root) + ':' + os.environ['PATH'],
                     'ILCHUL_PROJECT_PATH': str(root), 'TEST_COMMANDS': str(record)})
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('generation', result.stdout)
            self.assertNotIn('start ilchul-backend-green', record.read_text())


if __name__ == '__main__':
    unittest.main()

import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from test_vault_preflight import public_config


@unittest.skipUnless(shutil.which('docker'), 'Docker CLI unavailable; CI performs actual Compose rendering')
class ComposeRuntimeTest(unittest.TestCase):
    def test_both_colors_render_public_config_and_scoped_readonly_mount(self):
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / 'public.env'
            config.write_text(public_config())
            environment = {**os.environ,
                'BACKEND_IMAGE': 'ghcr.io/begae4/ilchul-backend:' + 'a' * 40,
                'FRONTEND_IMAGE': 'ghcr.io/begae4/ilchul-frontend:' + 'a' * 40}
            for color in ('blue', 'green'):
                result = subprocess.run(['docker', 'compose', '--env-file', str(config), '-f',
                    str(repository / ('docker-compose.' + color + '.yml')), 'config', '--format', 'json'],
                    text=True, capture_output=True, check=True, env=environment)
                service = json.loads(result.stdout)['services']['ilchul-backend-' + color]
                self.assertEqual(service['environment']['SERVER_PORT'], '8081')
                self.assertEqual(service['environment']['ILCHUL_RUNTIME_MODE'], 'vault')
                self.assertEqual(service['group_add'], ['984'])
                self.assertEqual(service['restart'], 'no')
                self.assertEqual(service['volumes'][0]['read_only'], True)
                self.assertNotIn('MYSQL_PASSWORD', service['environment'])


if __name__ == '__main__':
    unittest.main()

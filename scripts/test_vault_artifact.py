import os
from pathlib import Path
import subprocess
import unittest
import zipfile


class ArtifactTest(unittest.TestCase):
    def test_packaged_migration_cli_fails_closed_without_any_secret_mount(self):
        self.assertFalse(Path('/run/oci-service-secrets/ilchul-migration').exists(),
                         'This test must never run on an initialized production host')
        jar = Path(__file__).resolve().parents[1] / 'backend/build/libs/app.jar'
        self.assertTrue(jar.is_file(), 'Build the uniquely named executable bootJar first')
        with zipfile.ZipFile(jar) as archive:
            manifest = archive.read('META-INF/MANIFEST.MF').decode()
            self.assertIn('Start-Class: com.begae.backend.BackendApplication', manifest)
            self.assertIn('BOOT-INF/classes/com/begae/backend/config/RuntimeSecrets.class', archive.namelist())
        java = str(Path(os.environ['JAVA_HOME']) / 'bin/java') if 'JAVA_HOME' in os.environ else 'java'
        result = subprocess.run([java, '-jar', str(jar), '--ilchul-migrate'], text=True,
                                capture_output=True, timeout=30)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, '')
        self.assertEqual(result.stderr.strip(), 'ILCHUL_MIGRATION_FAILED')


if __name__ == '__main__':
    unittest.main()

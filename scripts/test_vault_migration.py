import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location('migration', Path(__file__).resolve().parents[1] / 'infrastructure/vault/ilchul-vault-migrate.py')
migration = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(migration)


class MigrationTest(unittest.TestCase):
    def test_rejects_mutable_foreign_and_injected_images(self):
        for image in ('ghcr.io/begae4/ilchul-backend:latest', 'other/image:' + 'a' * 40, 'a;id'):
            with self.assertRaises(ValueError):
                migration.validate_image(image)
        migration.validate_image('ghcr.io/begae4/ilchul-backend:' + 'a' * 40)

    def test_migration_container_has_only_root_migration_mount(self):
        args = migration.migration_args('ghcr.io/begae4/ilchul-backend:' + 'a' * 40, 'ilchul-migrate-test')
        self.assertIn('--read-only', args)
        self.assertIn('--cap-drop=ALL', args)
        self.assertIn('--log-driver=none', args)
        self.assertIn('--user=0:0', args)
        self.assertIn('--ilchul-migrate', args)
        mounts = [args[i + 1] for i, item in enumerate(args[:-1]) if item == '--mount']
        self.assertEqual(mounts, ['type=bind,src=/run/oci-service-secrets/ilchul-migration,dst=/run/oci-service-secrets/ilchul-migration,readonly'])
        self.assertNotIn('--env', args)
        self.assertNotIn('--env-file', args)

    def test_options_escape_without_allowing_option_injection(self):
        output = migration.mysql_options({'MYSQL_USER': 'test-user', 'MYSQL_PASSWORD': 'fake"\\value'})
        self.assertIn('password="fake\\"\\\\value"', output)
        for value in ('a\nb', 'a\rb', 'a\0b'):
            with self.assertRaises(ValueError):
                migration.mysql_options({'MYSQL_USER': 'test-user', 'MYSQL_PASSWORD': value})

    def test_cleanup_preserves_secrets_when_docker_state_is_unknown(self):
        def unavailable(*args, **kwargs):
            raise RuntimeError('unavailable')
        with self.assertRaises(RuntimeError):
            migration.remove_container('ilchul-migrate-test', unavailable)

    def test_prior_crashed_job_blocks_refresh_or_cleanup_of_its_secrets(self):
        from types import SimpleNamespace
        def existing(*args, **kwargs):
            return SimpleNamespace(stdout='ilchul-migrate-previous\n')
        with self.assertRaises(ValueError):
            migration.require_no_previous_jobs(existing)


if __name__ == '__main__':
    unittest.main()

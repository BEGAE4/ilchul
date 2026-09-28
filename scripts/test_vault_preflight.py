import importlib.util
import pathlib
import tempfile
import unittest

from vault_preflight import validate_public_env, validate_readiness, secure_file, require_closed_rollback_window


class PreflightTest(unittest.TestCase):
    def test_next_deployment_is_blocked_until_operator_acceptance(self):
        with tempfile.TemporaryDirectory() as directory:
            marker = pathlib.Path(directory) / 'pending.json'
            require_closed_rollback_window(marker)
            marker.write_text('{}')
            with self.assertRaises(ValueError):
                require_closed_rollback_window(marker)
            marker.unlink()
            marker.symlink_to(pathlib.Path(directory) / 'missing')
            with self.assertRaises(ValueError):
                require_closed_rollback_window(marker)
    def test_public_config_rejects_secret_and_unknown_fields(self):
        for field in ('MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD', 'JWT_SECRET_KEY', 'AWS_SECRET_ACCESS_KEY', 'OTHER'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate_public_env(field + '=test-only\n')

    def test_public_config_rejects_interpolation_and_duplicate_fields(self):
        for value in ('FRONTEND_BASE_URL=$(id)', 'FRONTEND_BASE_URL=`id`',
                      'FRONTEND_BASE_URL=${SECRET}', 'FRONTEND_BASE_URL=a\nFRONTEND_BASE_URL=b'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_public_env(value)

    def test_complete_public_config_is_accepted_without_secret(self):
        self.assertEqual(validate_public_env(public_config())['MYSQL_DATABASE'], 'ilchul_db')

    def test_unexpected_database_target_is_rejected(self):
        with self.assertRaises(ValueError):
            validate_public_env(public_config().replace('MYSQL_URL=mysql:3306', 'MYSQL_URL=public.example:3306'))

    def test_host_attestation_must_be_complete_and_explicit(self):
        approved = {'contractVersion': 1, 'checks': dict.fromkeys(
            ['accounts', 'vaultIam', 'publisher', 'bootRecovery', 'metadataBlocked',
             'backup', 'minioPolicy', 'redisCompatibility', 'rollback', 'productionApproval'], True)}
        validate_readiness(approved)
        for check in approved['checks']:
            changed = {'contractVersion': 1, 'checks': dict(approved['checks'], **{check: False})}
            with self.assertRaises(ValueError):
                validate_readiness(changed)

    def test_secure_file_rejects_symlink_and_world_readable_config(self):
        import os
        with tempfile.TemporaryDirectory() as directory:
            file = pathlib.Path(directory) / 'config'
            file.write_text('test-only')
            file.chmod(0o600)
            self.assertEqual(secure_file(file, owner=os.getuid()), 'test-only')
            file.chmod(0o644)
            with self.assertRaises(ValueError):
                secure_file(file, owner=os.getuid())
            file.chmod(0o600)
            link = pathlib.Path(directory) / 'link'
            link.symlink_to(file)
            with self.assertRaises((ValueError, OSError)):
                secure_file(link, owner=os.getuid())


def public_config():
    return '\n'.join([
        'MYSQL_DRIVER=com.mysql.cj.jdbc.Driver', 'MYSQL_URL=mysql:3306', 'MYSQL_DATABASE=ilchul_db',
        'REDIS_DB=redis', 'BACKEND_SERVER_PORT=8081', 'FRONTEND_SERVER_PORT=3001', 'ILCHUL_SECRET_GID=984',
        'OAUTH_GOOGLE_CLIENT_ID=test-client', 'OAUTH_GOOGLE_REDIRECT_URI=https://example.test/google',
        'OAUTH_KAKAO_REDIRECT_URI=https://example.test/kakao', 'OAUTH_NAVER_CLIENT_ID=test-client',
        'OAUTH_NAVER_REDIRECT_URI=https://example.test/naver', 'FRONTEND_BASE_URL=https://example.test',
        'STORAGE_ENDPOINT=http://minio:9000', 'STORAGE_BUCKET_NAME=ilchul', 'STORAGE_REGION=ap-northeast-1',
        'STORAGE_PUBLIC_URL=https://example.test/ilchul']) + '\n'


if __name__ == '__main__':
    unittest.main()

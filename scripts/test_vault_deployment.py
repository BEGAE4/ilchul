import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


SPEC = importlib.util.spec_from_file_location(
    'vault_deployment',
    Path(__file__).resolve().parents[1] / 'infrastructure/vault/ilchul-vault-deployment.py')
deployment = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(deployment)

OLD_SHA = '1' * 40
NEW_SHA = '2' * 40


class VaultDeploymentTest(unittest.TestCase):
    def test_project_symlink_blocks_deployment_preparation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            project = root / 'project'
            state = root / 'state'
            archive = root / 'archive'
            real_project = root / 'real-project'
            real_project.mkdir(mode=0o700)
            project.symlink_to(real_project, target_is_directory=True)
            state.mkdir(mode=0o700)
            archive.mkdir(mode=0o700)
            with self.assertRaises(ValueError):
                deployment.prepare_deployment(
                    project, state, archive, NEW_SHA, '12345', evidence('blue', 'blue', OLD_SHA))
            self.assertFalse((state / 'vault-acceptance-pending.json').exists())

    def test_existing_group_writable_color_file_is_validated(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'current_environment.txt'
            path.write_text('green\n')
            path.chmod(0o664)
            self.assertEqual(deployment.read_color_file(path, {path.stat().st_uid}), 'green')

    def test_failed_inactive_deployment_is_archived_and_superseded(self):
        with deployment_paths() as (project, state, archive):
            write_marker(project, {'sha': OLD_SHA, 'previous': 'blue', 'target': 'green'})

            deployment.prepare_deployment(
                project, state, archive, NEW_SHA, '12345', evidence('blue', 'blue', OLD_SHA))

            self.assertFalse((project / 'vault-acceptance-pending.json').exists())
            self.assertEqual(read_marker(state), {
                'schemaVersion': 2,
                'sha': NEW_SHA,
                'runId': '12345',
                'previous': 'blue',
                'target': 'green',
                'status': 'pending',
            })
            record = only_archive(archive)
            self.assertEqual(record['resolution'], 'failed-superseded')
            self.assertEqual(record['supersededBy'], NEW_SHA)
            self.assertEqual(record['marker'], {
                'sha': OLD_SHA, 'previous': 'blue', 'target': 'green'})

    def test_ambiguous_traffic_state_preserves_marker_and_blocks_recovery(self):
        with deployment_paths() as (project, state, archive):
            original = {'sha': OLD_SHA, 'previous': 'blue', 'target': 'green'}
            write_marker(state, original)

            with self.assertRaises(ValueError):
                deployment.prepare_deployment(
                    project, state, archive, NEW_SHA, '12345', evidence('blue', 'green', OLD_SHA))

            self.assertEqual(read_marker(state), original)
            self.assertEqual(list(archive.iterdir()), [])

    def test_successful_deployment_is_archived_and_pending_marker_is_removed(self):
        with deployment_paths() as (project, state, archive):
            write_marker(state, pending_marker(NEW_SHA, 'blue', 'green'))

            deployment.accept_deployment(
                state, archive, NEW_SHA, evidence('green', 'green', NEW_SHA))

            self.assertFalse((state / 'vault-acceptance-pending.json').exists())
            record = only_archive(archive)
            self.assertEqual(record['resolution'], 'accepted')
            self.assertIsNone(record['supersededBy'])
            self.assertEqual(record['marker'], pending_marker(NEW_SHA, 'blue', 'green'))
            self.assertEqual(record['verification'], {
                'currentColor': 'green',
                'activeColor': 'green',
                'healthyColors': ['green'],
                'backendSha': NEW_SHA,
                'frontendSha': NEW_SHA,
                'smokeOk': True,
                'migrationJobsAbsent': True,
            })

    def test_acceptance_rejects_wrong_live_image_and_preserves_marker(self):
        with deployment_paths() as (project, state, archive):
            marker = pending_marker(NEW_SHA, 'blue', 'green')
            write_marker(state, marker)

            with self.assertRaises(ValueError):
                deployment.accept_deployment(
                    state, archive, NEW_SHA, evidence('green', 'green', OLD_SHA))

            self.assertEqual(read_marker(state), marker)
            self.assertEqual(list(archive.iterdir()), [])

    def test_completed_but_unclosed_deployment_is_accepted_before_next_attempt(self):
        with deployment_paths() as (project, state, archive):
            write_marker(state, pending_marker(OLD_SHA, 'blue', 'green'))

            deployment.prepare_deployment(
                project, state, archive, NEW_SHA, '67890', evidence('green', 'green', OLD_SHA))

            self.assertEqual(read_marker(state), pending_marker(NEW_SHA, 'green', 'blue', '67890'))
            record = only_archive(archive)
            self.assertEqual(record['resolution'], 'accepted-late')
            self.assertEqual(record['marker']['sha'], OLD_SHA)


def pending_marker(sha, previous, target, run_id='12345'):
    return {
        'schemaVersion': 2,
        'sha': sha,
        'runId': run_id,
        'previous': previous,
        'target': target,
        'status': 'pending',
    }


def evidence(current, active, image_sha):
    return deployment.HostEvidence(
        current_color=current,
        active_color=active,
        healthy_colors=frozenset({current}),
        backend_shas={current: image_sha},
        frontend_shas={current: image_sha},
        smoke_ok=True,
        migration_jobs_absent=True,
    )


class deployment_paths:
    def __enter__(self):
        self.temporary = tempfile.TemporaryDirectory()
        root = Path(self.temporary.name)
        project = root / 'project'
        state = root / 'state'
        archive = root / 'archive'
        project.mkdir(mode=0o700)
        state.mkdir(mode=0o700)
        archive.mkdir(mode=0o700)
        return project, state, archive

    def __exit__(self, *args):
        self.temporary.cleanup()


def write_marker(root, value):
    marker = root / 'vault-acceptance-pending.json'
    marker.write_text(json.dumps(value))
    marker.chmod(0o600)


def read_marker(root):
    return json.loads((root / 'vault-acceptance-pending.json').read_text())


def only_archive(archive):
    paths = list(archive.iterdir())
    if len(paths) != 1:
        raise AssertionError(f'expected one archive, got {paths}')
    return json.loads(paths[0].read_text())


if __name__ == '__main__':
    unittest.main()

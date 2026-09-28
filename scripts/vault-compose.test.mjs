import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const yaml = require('js-yaml');
const read = path => yaml.load(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

for (const color of ['blue', 'green']) {
  test(`${color} backend receives only its own read-only secrets and public environment`, () => {
    const config = read(`docker-compose.${color}.yml`);
    const backend = config.services[`ilchul-backend-${color}`];
    assert.equal(backend.env_file, undefined);
    assert.equal(backend.environment.ILCHUL_RUNTIME_MODE, 'vault');
    assert.equal(backend.restart, 'no');
    assert.deepEqual(backend.cap_drop, ['ALL']);
    assert.equal(backend.read_only, true);
    assert.equal(backend.ports, undefined);
    assert.equal(backend.volumes.length, 1);
    assert.deepEqual(backend.volumes[0], {type: 'bind', source: '/run/oci-service-secrets/ilchul-backend',
      target: '/run/oci-service-secrets/ilchul-backend', read_only: true, bind: {create_host_path: false}});
    for (const key of Object.keys(backend.environment)) {
      assert.ok(!/PASSWORD|SECRET|TOKEN|ACCESS_KEY/.test(key), key);
    }
    const frontend = config.services[`ilchul-frontend-${color}`];
    assert.equal(frontend.env_file, undefined);
    assert.equal(frontend.volumes, undefined);
    assert.deepEqual(frontend.networks, ['ilchul-network']);
  });
}

test('production deploy jobs require the production environment; PR tests get no write permissions', () => {
  const deploy = read('.github/workflows/deploy.yml');
  assert.deepEqual(deploy.on.push.branches, ['main']);
  assert.equal(deploy.jobs['deploy-target'].environment, 'production');
  assert.equal(deploy.jobs['switch-traffic'].environment, 'production');
  const validation = read('.github/workflows/validate.yml');
  assert.deepEqual(validation.permissions, {contents: 'read'});
  assert.deepEqual(validation.on.pull_request.branches, ['main']);
});

# Ilchul Vault Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. User selected inline execution in the existing checkout.

**Goal:** Prepare a tested draft PR for file-based Vault credentials without production mutation.

**Architecture:** The existing host publisher emits one immutable tmpfs generation per service. Backend reads a strict JSON schema into Spring memory; migrations use a separate root-only mount. A host readiness gate blocks merge-triggered deployment until the operator prepares the infrastructure.

**Tech Stack:** Java 21, Spring Boot 3.5.3, Jackson 2, Flyway, Docker Compose, Python 3, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-21-vault-cutover-design.md`

## Global Constraints

- Existing OCI VM and blue/green topology; no provider change or paid resources.
- Branch from main; draft PR only; no main push, merge, live Secret/account change, or deployment.
- No production values in repository, env, logs, or PR. Preserve existing signing/external secrets.
- App receives no root/migration credentials; migration never runs during app startup in Vault mode.
- Keep existing worktrees and ignored credential input untouched.

## Task 1: Strict runtime reader and storage provider

Files: create `backend/src/main/java/com/begae/backend/config/RuntimeSecrets.java`,
`VaultStorageCredentials.java`, matching config tests; modify `BackendApplication.java`,
`S3StorageConfig.java`, `application.yml`.

Interfaces: `RuntimeSecrets implements ApplicationContextInitializer<ConfigurableApplicationContext>`;
`read(Path directory, Set<String> names, int owner)` returns immutable String map;
`VaultStorageCredentials.provider(Environment)` returns AwsCredentialsProvider.

- [ ] Create real temp generation fixtures (0750 directory, 0640 JSON) and assertions:
  `assertThatThrownBy(() -> RuntimeSecrets.read(dir, Set.of("MYSQL_PASSWORD"), owner)).hasMessage("RUNTIME_SECRET_UNAVAILABLE");`
  Cover wrong mode, symlink file, traversal link, missing/extra/duplicate/null/blank keys, invalid UTF-8, oversized file.
- [ ] Run `./gradlew test --tests '*RuntimeSecretsTest' --tests '*VaultStorageCredentialsTest' --no-daemon`; establish RED.
- [ ] Implement bounded strict JSON reads with no exception causes; add first-priority properties and force Flyway off/JPA none.
  Wire both S3 consumers to one provider; Vault mode must never use default credential chain.
- [ ] Run focused tests; commit exact paths after diff/secret review.

## Task 2: Host-only migration and deployment guard

Files: `scripts/vault_preflight.py`, `scripts/test_vault_preflight.py`,
`infrastructure/vault/ilchul-vault-migrate.py`, `RuntimeSecrets.java`, `BackendApplication.java`.

Interfaces: `--ilchul-migrate` CLI uses only ilchul-migration CONFIG_JSON; host command accepts one immutable backend image.
`vault_preflight.py` accepts no arguments in production and validates fixed `/etc/ilchul` readiness/config paths.

- [ ] Write failure tests proving unknown env fields and absent prerequisites stop before deployment side effects:
  `with self.assertRaises(ValueError): validate_public_env("MYSQL_PASSWORD=forbidden\n")`.
- [ ] Run `python3 -m unittest discover -s scripts -p 'test_vault*.py'`; establish RED.
- [ ] Implement host root/mode/tmpfs/unit/executable checks and strict public env allowlist.
  Migration wrapper takes an exclusive lock, refreshes root-only secrets, verifies a streamed database backup,
  runs Flyway with logging disabled, removes only its own container, then unpublishes migration material.
- [ ] Run Python tests and Java migration schema tests. Never execute host migration locally against production.

## Task 3: Compose and workflow integration

Files: both color Compose files, `.github/workflows/deploy.yml`, new `validate.yml`, `rollback.sh`.

- [ ] Add configuration tests against parsed Compose/workflow data: no backend env_file, no secret env values,
  explicit read-only single-service mount, no Docker auto-restart, immutable image tags and production environment.
- [ ] Replace ENV_FILE copying with preflight before scp and again before mutations. Refresh publisher before target recreation.
  Keep nonsecret configuration on host; pass image references as shell environment (never append credentials).
- [ ] Run host migration after pulling the immutable image and before target up. Remove MinIO admin policy mutation.
  Keep prior color running until operator validation; rollback starts existing containers only.
- [ ] Add secret-free PR backend tests/build, frontend build, Python deployment tests and shell checks.
  Run focused checks and commit exact paths.

## Task 4: Verification and draft PR

Files: `docs/VAULT_RUNTIME.md` and this plan's checkboxes.

- [ ] Record host publisher/systemd/Redis reconciliation prerequisites and coordinated merge checklist, with no fabricated PASS.
- [ ] Run Java full build, frontend build, Python tests, Compose validation, image-cleanup tests, shell syntax, diff checks.
- [ ] Review runtime/migration/rollback failure paths and remove accidental secrets/artifacts.
- [ ] Push only `security/vault-cutover-20260921` and create draft PR base main. Verify draft/base/head remotely.
- [ ] Report test outcomes and pending production preparation separately; do not enable auto-merge.

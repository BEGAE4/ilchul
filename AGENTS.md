# Repository operating rules

## Database changes

- `backend/src/main/resources/db/migration` is the executable schema source of truth.
- Never edit an applied Flyway migration. Add a forward migration with a version greater than the current maximum.
- Keep schema changes backward compatible with the active blue/green application whenever possible.
- Production DDL, migration execution, seeds, backfills, and deployments require explicit authorization and pre/post verification.

## Secrets and network access

- Never commit or print credentials, private keys, production `.env` contents, or customer data.
- Frontend containers receive only explicitly allowlisted, non-secret environment variables.
- Runtime secrets belong in a managed secret store and must be scoped to the backend service that uses them.
- Do not expose databases or internal service ports to public interfaces. Prefer private networking and audited, individual operator access.
- Do not create or distribute shared SSH private keys or long-lived cloud access keys.

## Delivery checks

- Run backend tests and the frontend build before deployment.
- Deploy immutable image tags or digests from the default branch.
- Verify Flyway startup, both container health checks, Nginx configuration, authentication behavior, and public smoke tests before retiring the previous color.
- Do not include `Co-Authored-By: Codex` trailers in commits.

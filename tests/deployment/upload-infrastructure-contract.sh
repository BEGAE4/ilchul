#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)
GATEWAY_NGINX="$REPO_ROOT/nginx/conf.d/ilchul.conf"
MINIO_POLICY="$REPO_ROOT/infrastructure/minio/anonymous-read-policy.json"
DEPLOY_WORKFLOW="$REPO_ROOT/.github/workflows/deploy.yml"

grep -Eq 'client_max_body_size[[:space:]]+90[Mm];' "$GATEWAY_NGINX"
grep -Eq 'error_page[[:space:]]+413[[:space:]]*=' "$GATEWAY_NGINX"
grep -Fq '"status":413' "$GATEWAY_NGINX"

test ! -e "$REPO_ROOT/nginx/host/ilchul.conf"
if grep -Eq 'nginx/host/ilchul\.conf|HOST_NGINX|sudo -n nginx|restore_host_nginx' "$DEPLOY_WORKFLOW"; then
    echo "deployment workflow must not manage host Nginx" >&2
    exit 1
fi

jq -e '
  [.Statement[] | select(.Effect == "Allow") | .Resource[]] as $resources
  | ($resources | index("arn:aws:s3:::ilchul/plan/*")) != null
  and ($resources | index("arn:aws:s3:::ilchul/users/profile/*")) != null
  and ($resources | index("arn:aws:s3:::ilchul/users/*")) == null
  and ($resources | index("arn:aws:s3:::ilchul/cs-inquiry/*")) == null
' "$MINIO_POLICY" >/dev/null

grep -Fq 'infrastructure/minio/anonymous-read-policy.json' "$DEPLOY_WORKFLOW"
grep -Fq 'mc anonymous set-json' "$DEPLOY_WORKFLOW"

echo "upload infrastructure contract: pass"

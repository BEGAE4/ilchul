#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)
HOST_NGINX="$REPO_ROOT/nginx/host/ilchul.conf"
GATEWAY_NGINX="$REPO_ROOT/nginx/conf.d/ilchul.conf"
MINIO_POLICY="$REPO_ROOT/infrastructure/minio/anonymous-read-policy.json"
DEPLOY_WORKFLOW="$REPO_ROOT/.github/workflows/deploy.yml"

for nginx_config in "$HOST_NGINX" "$GATEWAY_NGINX"; do
    grep -Eq 'client_max_body_size[[:space:]]+90[Mm];' "$nginx_config"
    grep -Eq 'error_page[[:space:]]+413[[:space:]]*=' "$nginx_config"
    grep -Fq '"status":413' "$nginx_config"
done

jq -e '
  [.Statement[] | select(.Effect == "Allow") | .Resource[]] as $resources
  | ($resources | index("arn:aws:s3:::ilchul/plan/*")) != null
  and ($resources | index("arn:aws:s3:::ilchul/users/profile/*")) != null
  and ($resources | index("arn:aws:s3:::ilchul/users/*")) == null
  and ($resources | index("arn:aws:s3:::ilchul/cs-inquiry/*")) == null
' "$MINIO_POLICY" >/dev/null

grep -Fq 'infrastructure/minio/anonymous-read-policy.json' "$DEPLOY_WORKFLOW"
grep -Fq 'mc anonymous set-json' "$DEPLOY_WORKFLOW"
grep -Fq 'nginx/host/ilchul.conf' "$DEPLOY_WORKFLOW"
grep -Fq 'nginx -t' "$DEPLOY_WORKFLOW"
grep -Fq 'restore_host_nginx' "$DEPLOY_WORKFLOW"

echo "upload infrastructure contract: pass"

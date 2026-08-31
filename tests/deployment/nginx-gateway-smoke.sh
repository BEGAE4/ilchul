#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)
COMPOSE_FILE="$REPO_ROOT/docker-compose.nginx.yml"
NGINX_CONFIG_DIR="$REPO_ROOT/nginx/conf.d"
UPSTREAM_DIR="$REPO_ROOT/nginx/upstreams"

for required_path in \
    "$COMPOSE_FILE" \
    "$NGINX_CONFIG_DIR/ilchul.conf" \
    "$UPSTREAM_DIR/blue.conf" \
    "$UPSTREAM_DIR/green.conf"; do
    if [ ! -f "$required_path" ]; then
        echo "missing gateway artifact: $required_path" >&2
        exit 1
    fi
done

DOCKER_BIN=${DOCKER_BIN:-docker}
"$DOCKER_BIN" compose -f "$COMPOSE_FILE" config --quiet
COMPOSE_PROJECT=$("$DOCKER_BIN" compose -f "$COMPOSE_FILE" config | sed -n 's/^name: //p' | head -n 1)
if [ "$COMPOSE_PROJECT" != "ilchul-nginx-gateway" ]; then
    echo "gateway Compose project must be isolated, got: $COMPOSE_PROJECT" >&2
    exit 1
fi
NGINX_IMAGE=$("$DOCKER_BIN" compose -f "$COMPOSE_FILE" config --images | head -n 1)

TEST_PREFIX="ilchul-nginx-test-$$"
TEST_NETWORK="$TEST_PREFIX-network"
BLUE_CONTAINER="$TEST_PREFIX-blue"
GREEN_CONTAINER="$TEST_PREFIX-green"
GATEWAY_CONTAINER="$TEST_PREFIX-gateway"
TEST_DIR=$(mktemp -d "${TMPDIR:-/tmp}/ilchul-nginx-test.XXXXXX")

cleanup() {
    "$DOCKER_BIN" rm -f \
        "$GATEWAY_CONTAINER" \
        "$BLUE_CONTAINER" \
        "$GREEN_CONTAINER" >/dev/null 2>&1 || true
    "$DOCKER_BIN" network rm "$TEST_NETWORK" >/dev/null 2>&1 || true
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

mkdir -p "$TEST_DIR/runtime"

cat >"$TEST_DIR/blue.conf" <<'EOF'
server {
    listen 3001;
    location / { default_type text/plain; return 200 "blue-frontend"; }
}
server {
    listen 8081;
    location / { default_type text/plain; return 200 "blue-backend"; }
}
EOF

cat >"$TEST_DIR/green.conf" <<'EOF'
server {
    listen 3001;
    location / { default_type text/plain; return 200 "green-frontend"; }
}
server {
    listen 8081;
    location / { default_type text/plain; return 200 "green-backend"; }
}
EOF

cp "$UPSTREAM_DIR/blue.conf" "$TEST_DIR/runtime/active.conf"

"$DOCKER_BIN" network create "$TEST_NETWORK" >/dev/null
"$DOCKER_BIN" run -d \
    --name "$BLUE_CONTAINER" \
    --network "$TEST_NETWORK" \
    --network-alias ilchul-frontend-blue \
    --network-alias ilchul-backend-blue \
    --mount "type=bind,src=$TEST_DIR/blue.conf,dst=/etc/nginx/conf.d/default.conf,readonly" \
    "$NGINX_IMAGE" >/dev/null
"$DOCKER_BIN" run -d \
    --name "$GREEN_CONTAINER" \
    --network "$TEST_NETWORK" \
    --network-alias ilchul-frontend-green \
    --network-alias ilchul-backend-green \
    --mount "type=bind,src=$TEST_DIR/green.conf,dst=/etc/nginx/conf.d/default.conf,readonly" \
    "$NGINX_IMAGE" >/dev/null
"$DOCKER_BIN" run -d \
    --name "$GATEWAY_CONTAINER" \
    --network "$TEST_NETWORK" \
    --publish 127.0.0.1::80 \
    --mount "type=bind,src=$NGINX_CONFIG_DIR,dst=/etc/nginx/conf.d,readonly" \
    --mount "type=bind,src=$TEST_DIR/runtime,dst=/etc/nginx/runtime,readonly" \
    "$NGINX_IMAGE" >/dev/null

GATEWAY_PORT=$("$DOCKER_BIN" port "$GATEWAY_CONTAINER" 80/tcp | awk -F: 'END { print $NF }')

wait_for_response() {
    expected_body=$1
    request_path=$2
    last_body=""

    for _ in $(seq 1 50); do
        last_body=$(curl -fsS \
            --max-time 2 \
            -H "Host: il-chul.com" \
            "http://127.0.0.1:${GATEWAY_PORT}${request_path}" 2>/dev/null || true)
        if [ "$last_body" = "$expected_body" ]; then
            return 0
        fi
        sleep 0.2
    done

    echo "expected ${request_path}=${expected_body}, got ${last_body}" >&2
    return 1
}

wait_for_response blue-frontend /intro
wait_for_response blue-backend /api/test

cp "$UPSTREAM_DIR/green.conf" "$TEST_DIR/runtime/active.conf.new"
mv "$TEST_DIR/runtime/active.conf.new" "$TEST_DIR/runtime/active.conf"
"$DOCKER_BIN" exec "$GATEWAY_CONTAINER" nginx -t
"$DOCKER_BIN" exec "$GATEWAY_CONTAINER" nginx -s reload

wait_for_response green-frontend /intro
wait_for_response green-backend /api/test

echo "gateway blue/green smoke test: pass"

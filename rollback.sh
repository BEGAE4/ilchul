#!/bin/bash
# begae 계정 및 분리된 컨테이너 구조에 최적화된 롤백 스크립트

set -euo pipefail

# 1. 경로 및 설정 (사용자 환경에 맞게 수정됨)
PROJECT_PATH="${ILCHUL_PROJECT_PATH:-/home/begae/ilchul}"
ILCHUL_NGINX="ilchul-nginx"
cd "$PROJECT_PATH"

echo "=== 🔄 Blue-Green Rollback Start ==="

# 2. 현재 환경 확인
if [ -f current_environment.txt ]; then
    CURRENT_ENV=$(cat current_environment.txt | tr -d '[:space:]')
else
    echo "❌ current_environment.txt를 찾을 수 없습니다."
    exit 1
fi
case "$CURRENT_ENV" in blue|green) ;; *) echo 'Unknown active color'; exit 1 ;; esac

ACTIVE_CONFIG="$PROJECT_PATH/nginx/runtime/active.conf"
install -d -m 0755 "$PROJECT_PATH/nginx/runtime"
if [ ! -f "$ACTIVE_CONFIG" ]; then
    install -m 0644 "$PROJECT_PATH/nginx/upstreams/${CURRENT_ENV}.conf" "${ACTIVE_CONFIG}.new"
    mv "${ACTIVE_CONFIG}.new" "$ACTIVE_CONFIG"
fi
# Rollback does not recreate containers from today's Compose/image references.
docker inspect "$ILCHUL_NGINX" >/dev/null
docker start "$ILCHUL_NGINX" >/dev/null

# 3. 롤백 타겟 결정
if [ "$CURRENT_ENV" = "blue" ]; then
    ROLLBACK_ENV="green"
else
    ROLLBACK_ENV="blue"
fi

echo "현재 활성 환경: $CURRENT_ENV"
echo "롤백 대상 환경: $ROLLBACK_ENV"

# 4. 중지되었던 이전 버전 컨테이너 깨우기
echo "🚀 $ROLLBACK_ENV 컨테이너를 다시 시작합니다..."
# 공통 yml 없이 단독 실행 파일만 사용
docker network inspect shared-infra >/dev/null
docker inspect "ilchul-backend-${ROLLBACK_ENV}" "ilchul-frontend-${ROLLBACK_ENV}" >/dev/null
VAULT_MOUNT=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/run/oci-service-secrets/ilchul-backend"}}{{.Source}}{{end}}{{end}}' "ilchul-backend-${ROLLBACK_ENV}")
BACKEND_RUNNING=$(docker inspect --format '{{.State.Running}}' "ilchul-backend-${ROLLBACK_ENV}")
if [ -n "$VAULT_MOUNT" ] && [ "$BACKEND_RUNNING" != "true" ]; then
    echo 'Stopped Vault rollback container requires operator secret generation verification; refusing automatic restart.'
    exit 1
fi
docker start "ilchul-backend-${ROLLBACK_ENV}" "ilchul-frontend-${ROLLBACK_ENV}" >/dev/null

# 5. 두 컨테이너가 실제로 healthy가 될 때까지 대기
BACKEND_CONTAINER="ilchul-backend-${ROLLBACK_ENV}"
FRONTEND_CONTAINER="ilchul-frontend-${ROLLBACK_ENV}"
for attempt in $(seq 1 30); do
    BACKEND_HEALTH=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$BACKEND_CONTAINER")
    FRONTEND_HEALTH=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$FRONTEND_CONTAINER")
    if [ "$BACKEND_HEALTH" = "healthy" ] && [ "$FRONTEND_HEALTH" = "healthy" ] \
        && docker exec "$BACKEND_CONTAINER" sh -lc 'wget --quiet --spider "http://127.0.0.1:$SERVER_PORT/actuator/health"' \
        && docker exec "$FRONTEND_CONTAINER" sh -lc 'wget --quiet --spider "http://127.0.0.1:$PORT/intro"'; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        echo "❌ 컨테이너가 정상 상태가 되지 않아 롤백을 중단합니다."
        exit 1
    fi
    echo "대기 중: backend=${BACKEND_HEALTH}, frontend=${FRONTEND_HEALTH} (${attempt}/30)"
    sleep 5
done

echo ""
echo "✅ $ROLLBACK_ENV 환경이 모두 정상입니다."

# 7. 최종 확인 (실수 방지)
read -p "정말로 $ROLLBACK_ENV(으)로 트래픽을 돌리시겠습니까? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "롤백이 취소되었습니다."
    exit 0
fi

# 8. Nginx 트래픽 전환
echo "🌐 Nginx 트래픽 스위칭: $ROLLBACK_ENV"
activate_environment() {
    active_environment=$1
    source_config="$PROJECT_PATH/nginx/upstreams/${active_environment}.conf"
    install -m 0644 "$source_config" "${ACTIVE_CONFIG}.new"
    mv "${ACTIVE_CONFIG}.new" "$ACTIVE_CONFIG"
    docker exec "$ILCHUL_NGINX" nginx -t || return 1
    docker exec "$ILCHUL_NGINX" nginx -s reload || return 1
}

if ! activate_environment "$ROLLBACK_ENV"; then
    echo "❌ Nginx 설정 전환 실패: $CURRENT_ENV 환경으로 복원합니다."
    activate_environment "$CURRENT_ENV"
    exit 1
fi

FRONTEND_STATUS=$(curl --max-time 20 --silent --output /dev/null --write-out '%{http_code}' https://il-chul.com/intro) || FRONTEND_STATUS=000
AUTH_STATUS=$(curl --max-time 20 --silent --output /dev/null --write-out '%{http_code}' https://il-chul.com/api/plan/1) || AUTH_STATUS=000
if [ "$FRONTEND_STATUS" != "200" ] || [ "$AUTH_STATUS" != "401" ]; then
    echo "❌ 롤백 후 스모크 테스트 실패: frontend=${FRONTEND_STATUS}, unauthenticated_api=${AUTH_STATUS}"
    activate_environment "$CURRENT_ENV"
    exit 1
fi

# 9. 상태 업데이트 및 문제 있던 환경 중지
echo "$ROLLBACK_ENV" > current_environment.txt
echo "💤 문제가 있었던 $CURRENT_ENV 환경을 중지합니다."
docker stop "ilchul-backend-${CURRENT_ENV}" "ilchul-frontend-${CURRENT_ENV}"

echo "🎉 롤백 완료! 현재 서비스 중인 환경: $ROLLBACK_ENV"

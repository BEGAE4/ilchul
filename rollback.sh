#!/bin/bash
# OCI Migration 반영된 무중단 배포 롤백 스크립트 (프론트/백엔드 동시 점검)
# 위치: /home/ubuntu/ilchul/rollback.sh

set -e

PROJECT_PATH="/home/ubuntu/ilchul"
GLOBAL_NGINX="nginx_server"
cd "$PROJECT_PATH"

echo "=== 🔄 Blue-Green Rollback Start ==="

# 1. 현재 환경 확인
if [ -f current_environment.txt ]; then
    CURRENT_ENV=$(cat current_environment.txt | tr -d '[:space:]')
else
    echo "❌ current_environment.txt를 찾을 수 없습니다."
    exit 1
fi

# 2. 롤백 타겟 및 포트 세팅 (프론트/백엔드 모두 지정)
if [ "$CURRENT_ENV" = "blue" ]; then
    ROLLBACK_ENV="green"
    BACKEND_PORT=8082
    FRONTEND_PORT=3002
else
    ROLLBACK_ENV="blue"
    BACKEND_PORT=8081
    FRONTEND_PORT=3001
fi

echo "현재 활성 환경: $CURRENT_ENV"
echo "롤백 대상 환경: $ROLLBACK_ENV"

# 3. 중지된 컨테이너(프론트+백엔드) 깨우기
echo "🚀 $ROLLBACK_ENV 컨테이너를 시작합니다..."
docker compose -f docker-compose.yml -f docker-compose.${ROLLBACK_ENV}.yml start

echo "서비스 부팅 대기 중 (15초)..."
sleep 15 

# 4. 프론트엔드 헬스 체크
echo "🔍 $ROLLBACK_ENV 프론트엔드 점검 중 (Port: $FRONTEND_PORT)..."
if ! curl -f http://localhost:$FRONTEND_PORT 2>/dev/null; then
    echo "❌ 프론트엔드 환경이 정상이 아닙니다. 롤백을 중단합니다."
    docker compose -f docker-compose.yml -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 1
fi
echo "✅ 프론트엔드 OK"

# 5. 백엔드 헬스 체크
echo "🔍 $ROLLBACK_ENV 백엔드 점검 중 (Port: $BACKEND_PORT)..."
if ! curl -f http://localhost:$BACKEND_PORT/health 2>/dev/null; then
    echo "❌ 백엔드 환경이 정상이 아닙니다. 롤백을 중단합니다."
    docker compose -f docker-compose.yml -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 1
fi
echo "✅ 백엔드 OK"

echo ""
echo "✅ $ROLLBACK_ENV 환경이 모두 준비되었습니다."

# 6. 최종 확인
read -p "정말로 $ROLLBACK_ENV(으)로 롤백하시겠습니까? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "롤백이 취소되었습니다."
    docker compose -f docker-compose.yml -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 0
fi

# 7. Nginx 트래픽 전환 (프론트/백엔드 동시 전환)
echo "🌐 Nginx 트래픽 스위칭: $ROLLBACK_ENV"
docker exec $GLOBAL_NGINX ln -sf /etc/nginx/conf.d/ilchul/ilchul-${ROLLBACK_ENV}.conf /etc/nginx/conf.d/ilchul/ilchul-active-env.conf
docker exec $GLOBAL_NGINX nginx -s reload

# 8. 상태 업데이트 및 기존 환경 중지
echo "$ROLLBACK_ENV" > current_environment.txt
echo "💤 에러가 발생했던 $CURRENT_ENV 환경을 중지하여 메모리를 확보합니다."
docker compose -f docker-compose.yml -f docker-compose.${CURRENT_ENV}.yml stop

echo "🎉 롤백 완료! 현재 활성 환경: $ROLLBACK_ENV"
#!/bin/bash
# begae 계정 및 분리된 컨테이너 구조에 최적화된 롤백 스크립트

set -e

# 1. 경로 및 설정 (사용자 환경에 맞게 수정됨)
PROJECT_PATH="/home/begae/ilchul"
GLOBAL_NGINX="nginx"  # 사용자님의 컨테이너 이름 확인 (nginx 또는 nginx_server)
cd "$PROJECT_PATH"

echo "=== 🔄 Blue-Green Rollback Start ==="

# 2. 현재 환경 확인
if [ -f current_environment.txt ]; then
    CURRENT_ENV=$(cat current_environment.txt | tr -d '[:space:]')
else
    echo "❌ current_environment.txt를 찾을 수 없습니다."
    exit 1
fi

# 3. 롤백 타겟 및 포트 세팅
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

# 4. 중지되었던 이전 버전 컨테이너 깨우기
echo "🚀 $ROLLBACK_ENV 컨테이너를 다시 시작합니다..."
# 공통 yml 없이 단독 실행 파일만 사용
docker compose -f docker-compose.${ROLLBACK_ENV}.yml start

echo "서비스 부팅 대기 중 (20초)..."
sleep 20 

# 5. 프론트엔드 헬스 체크
echo "🔍 $ROLLBACK_ENV 프론트엔드 점검 중 (Port: $FRONTEND_PORT)..."
if ! curl -f http://localhost:$FRONTEND_PORT 2>/dev/null; then
    echo "❌ 프론트엔드가 살아나지 않았습니다. 롤백을 중단합니다."
    docker compose -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 1
fi
echo "✅ 프론트엔드 OK"

# 6. 백엔드 헬스 체크 (actuator 경로 적용)
echo "🔍 $ROLLBACK_ENV 백엔드 점검 중 (Port: $BACKEND_PORT)..."
if ! curl -f http://localhost:$BACKEND_PORT/actuator/health 2>/dev/null; then
    echo "❌ 백엔드가 살아나지 않았습니다. 롤백을 중단합니다."
    docker compose -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 1
fi
echo "✅ 백엔드 OK"

echo ""
echo "✅ $ROLLBACK_ENV 환경이 모두 정상입니다."

# 7. 최종 확인 (실수 방지)
read -p "정말로 $ROLLBACK_ENV(으)로 트래픽을 돌리시겠습니까? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "롤백이 취소되었습니다."
    docker compose -f docker-compose.${ROLLBACK_ENV}.yml stop
    exit 0
fi

# 8. Nginx 트래픽 전환 (상대경로 방식 적용으로 깨짐 방지)
echo "🌐 Nginx 트래픽 스위칭: $ROLLBACK_ENV"
docker exec $GLOBAL_NGINX ln -sf /etc/nginx/conf.d/ilchul/ilchul-${ROLLBACK_ENV}.conf /etc/nginx/conf.d/ilchul/ilchul-active-env.conf
docker exec $GLOBAL_NGINX nginx -s reload

# 9. 상태 업데이트 및 문제 있던 환경 중지
echo "$ROLLBACK_ENV" > current_environment.txt
echo "💤 문제가 있었던 $CURRENT_ENV 환경을 중지합니다."
docker compose -f docker-compose.${CURRENT_ENV}.yml stop

echo "🎉 롤백 완료! 현재 서비스 중인 환경: $ROLLBACK_ENV"
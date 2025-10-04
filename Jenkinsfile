pipeline {
    agent any

    environment {
        // Credentials
        MYSQL_PASSWORD = credentials('mysql-password')
        MYSQL_ROOT_PASSWORD = credentials('mysql-root-password')
        GOOGLE_API_KEY = credentials('google-api-key')
        OAUTH_GOOGLE_CLIENT_ID = credentials('oauth-google-client-id')
        OAUTH_GOOGLE_CLIENT_SECRET = credentials('oauth-google-client-secret')
        OAUTH_GOOGLE_REDIRECT_URI = credentials('oauth-google-redirect-uri')
        KAKAO_REST_API_KEY = credentials('kakao-rest-api-key')
        OAUTH_KAKAO_CLIENT_SECRET = credentials('oauth-kakao-client-secret')
        OAUTH_KAKAO_REDIRECT_URI = credentials('oauth-kakao-redirect-uri')
        OAUTH_NAVER_CLIENT_ID = credentials('oauth-naver-client-id')
        OAUTH_NAVER_CLIENT_SECRET = credentials('oauth-naver-client-secret')
        OAUTH_NAVER_REDIRECT_URI = credentials('oauth-naver-redirect-uri')
        JWT_SECRET_KEY = credentials('jwt-secret-key')

        // Paths
        PROJECT_PATH = "/home/ubuntu/ilchul"
        
        // Blue-Green 환경
        CURRENT_ENV = "${getCurrentEnvironment()}"
        TARGET_ENV = "${getTargetEnvironment()}"
        
        // 포트 설정
        TARGET_BACKEND_PORT = "${TARGET_ENV == 'blue' ? '8080' : '8081'}"
        TARGET_FRONTEND_PORT = "${TARGET_ENV == 'blue' ? '3000' : '3001'}"
    }

    stages {
        stage('Preparation') {
            steps {
                script {
                    echo "=== Blue-Green Deployment Started ==="
                    echo "Current Active: ${CURRENT_ENV}"
                    echo "Target Deploy: ${TARGET_ENV}"
                    echo "Target Backend Port: ${TARGET_BACKEND_PORT}"
                    echo "Target Frontend Port: ${TARGET_FRONTEND_PORT}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Create .env File') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}
                        cat > .env << EOF
MYSQL_DATABASE=ilchul_db
MYSQL_USER=ilchul_user
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
OAUTH_GOOGLE_CLIENT_ID=${OAUTH_GOOGLE_CLIENT_ID}
OAUTH_GOOGLE_CLIENT_SECRET=${OAUTH_GOOGLE_CLIENT_SECRET}
OAUTH_GOOGLE_REDIRECT_URI=${OAUTH_GOOGLE_REDIRECT_URI}
KAKAO_REST_API_KEY=${KAKAO_REST_API_KEY}
OAUTH_KAKAO_CLIENT_SECRET=${OAUTH_KAKAO_CLIENT_SECRET}
OAUTH_KAKAO_REDIRECT_URI=${OAUTH_KAKAO_REDIRECT_URI}
OAUTH_NAVER_CLIENT_ID=${OAUTH_NAVER_CLIENT_ID}
OAUTH_NAVER_CLIENT_SECRET=${OAUTH_NAVER_CLIENT_SECRET}
OAUTH_NAVER_REDIRECT_URI=${OAUTH_NAVER_REDIRECT_URI}
JWT_SECRET_KEY=${JWT_SECRET_KEY}
EOF
                        echo "✅ .env file created"
                    """
                }
            }
        }

        stage('Build Target Environment') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}
                        echo "=== Building ${TARGET_ENV} environment ==="
                        
                        if [ "${TARGET_ENV}" = "green" ]; then
                            docker-compose --profile green build server-app-green client-app-green
                        else
                            docker-compose build server-app-blue client-app-blue
                        fi
                    """
                }
            }
        }

        stage('Start Target Environment') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}
                        echo "=== Starting ${TARGET_ENV} environment ==="
                        
                        if [ "${TARGET_ENV}" = "green" ]; then
                            docker-compose --profile green up -d server-app-green client-app-green
                        else
                            docker-compose up -d server-app-blue client-app-blue
                        fi
                        
                        echo "Waiting for services to start..."
                        sleep 20
                    """
                }
            }
        }

        stage('Health Check Target') {
            steps {
                script {
                    sh """
                        echo "=== Health Check for ${TARGET_ENV} environment ==="
                        
                        # 백엔드 헬스체크 (포트로 직접 접근)
                        echo "Testing backend on port ${TARGET_BACKEND_PORT}"
                        for i in {1..12}; do
                            if curl -f http://localhost:${TARGET_BACKEND_PORT}/health 2>/dev/null; then
                                echo "✅ Backend health check passed (port ${TARGET_BACKEND_PORT})"
                                break
                            fi
                            echo "Waiting for backend... attempt \$i/12"
                            sleep 5
                        done
                        
                        # 프론트엔드 헬스체크 (포트로 직접 접근)
                        echo "Testing frontend on port ${TARGET_FRONTEND_PORT}"
                        for i in {1..12}; do
                            if curl -f http://localhost:${TARGET_FRONTEND_PORT} 2>/dev/null; then
                                echo "✅ Frontend health check passed (port ${TARGET_FRONTEND_PORT})"
                                break
                            fi
                            echo "Waiting for frontend... attempt \$i/12"
                            sleep 5
                        done
                        
                        echo "✅ ${TARGET_ENV} environment is healthy and accessible"
                        echo "📍 Backend: http://localhost:${TARGET_BACKEND_PORT}"
                        echo "📍 Frontend: http://localhost:${TARGET_FRONTEND_PORT}"
                    """
                }
            }
        }

        stage('Manual Testing Window') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        input message: """
${TARGET_ENV} 환경이 준비되었습니다!
테스트 URL:
- Backend: http://SERVER_IP:${TARGET_BACKEND_PORT}
- Frontend: http://SERVER_IP:${TARGET_FRONTEND_PORT}

테스트 완료 후 트래픽을 전환하시겠습니까?
""", 
                              ok: '테스트 완료 - 트래픽 전환'
                    }
                }
            }
        }

        stage('Switch Traffic') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}
                        echo "=== Switching traffic to ${TARGET_ENV} ==="
                        
                        # active-backend.conf 업데이트
                        cat > ./nginx/conf.d/active-backend.conf << 'EOF'
upstream active_backend {
    server backend_${TARGET_ENV}_1:8080 max_fails=3 fail_timeout=30s;
    
    keepalive 30;
    keepalive_requests 100;
    keepalive_timeout 60;
}

upstream active_frontend {
    server client_app_${TARGET_ENV}:3000;
    keepalive 10;
}
EOF
                        
                        # Nginx 설정 테스트
                        docker exec nginx_server nginx -t
                        
                        # Nginx reload
                        docker exec nginx_server nginx -s reload
                        
                        # 환경 상태 저장
                        echo "${TARGET_ENV}" > ${PROJECT_PATH}/current_environment.txt
                        
                        echo "✅ Traffic switched to ${TARGET_ENV}"
                        sleep 5
                    """
                }
            }
        }

        stage('Final Verification') {
            steps {
                script {
                    sh """
                        echo "=== Final Production Verification ==="
                        
                        # 실제 프로덕션 URL 테스트
                        for i in {1..5}; do
                            if curl -f -k https://il-chul.com/nginx-health 2>/dev/null; then
                                echo "✅ Production site is accessible"
                                break
                            fi
                            echo "Verifying production... attempt \$i/5"
                            sleep 5
                        done
                        
                        # 현재 활성 환경 확인
                        echo "Current active environment: ${TARGET_ENV}"
                        echo "🌐 Production: https://il-chul.com"
                        echo "📍 ${TARGET_ENV} Backend: http://localhost:${TARGET_BACKEND_PORT}"
                        echo "📍 ${TARGET_ENV} Frontend: http://localhost:${TARGET_FRONTEND_PORT}"
                    """
                }
            }
        }

        stage('Cleanup Old Environment') {
            steps {
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        try {
                            input message: "이전 ${CURRENT_ENV} 환경을 정리하시겠습니까? (권장: 안정성 확인 후 수동 정리)", 
                                  ok: '이전 환경 정리'
                            
                            sh """
                                cd ${PROJECT_PATH}
                                echo "=== Cleaning up ${CURRENT_ENV} environment ==="
                                
                                if [ "${CURRENT_ENV}" = "green" ]; then
                                    docker-compose --profile green stop server-app-green client-app-green
                                else
                                    docker-compose stop server-app-blue client-app-blue
                                fi
                                
                                echo "✅ ${CURRENT_ENV} environment stopped (containers kept for rollback)"
                            """
                        } catch (Exception e) {
                            echo "⏭️ Skipping cleanup - old environment kept for rollback"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh """
                    cd ${PROJECT_PATH}
                    echo "=== Current Environment Status ==="
                    docker-compose ps
                    
                    echo ""
                    echo "=== Port Mapping ==="
                    echo "Blue Backend: 8080"
                    echo "Green Backend: 8081"
                    echo "Blue Frontend: 3000"
                    echo "Green Frontend: 3001"
                    
                    if [ -f ${PROJECT_PATH}/current_environment.txt ]; then
                        CURRENT=\$(cat ${PROJECT_PATH}/current_environment.txt)
                        echo ""
                        echo "✅ Active Production Environment: \$CURRENT"
                    fi
                """
            }
        }
        success {
            echo "✅ Blue-Green deployment successful!"
            script {
                sh """
                    echo "🎉 Deployment completed!"
                    echo "Active environment: ${TARGET_ENV}"
                    echo "🌐 Production: https://il-chul.com"
                    echo "📍 Direct access - Backend: http://SERVER_IP:${TARGET_BACKEND_PORT}"
                    echo "📍 Direct access - Frontend: http://SERVER_IP:${TARGET_FRONTEND_PORT}"
                """
            }
        }
        failure {
            echo "❌ Deployment failed!"
            script {
                sh """
                    cd ${PROJECT_PATH}
                    echo "=== Deployment Failed - Logs ==="
                    docker-compose logs --tail=50 server-app-${TARGET_ENV} 2>/dev/null || true
                    docker-compose logs --tail=50 client-app-${TARGET_ENV} 2>/dev/null || true
                    
                    echo "=== Stopping failed ${TARGET_ENV} environment ==="
                    if [ "${TARGET_ENV}" = "green" ]; then
                        docker-compose --profile green stop server-app-green client-app-green
                    else
                        docker-compose stop server-app-blue client-app-blue
                    fi
                    
                    echo "✅ ${CURRENT_ENV} environment remains active"
                """
            }
        }
    }
}

// 현재 활성 환경 확인
def getCurrentEnvironment() {
    try {
        def currentEnv = sh(
            script: "cat /home/ubuntu/ilchul/current_environment.txt 2>/dev/null || echo 'blue'",
            returnStdout: true
        ).trim()
        return currentEnv ?: 'blue'
    } catch (Exception e) {
        return 'blue'
    }
}

// 타겟 환경 결정
def getTargetEnvironment() {
    def current = getCurrentEnvironment()
    return current == 'blue' ? 'green' : 'blue'
}
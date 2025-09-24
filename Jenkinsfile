pipeline {
    agent any

    environment {
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

        PROJECT_PATH = "/home/ubuntu/ilchul"
        SCRIPT_PATH = "/home/ubuntu/ilchul/script"
        
        // Blue-Green 환경 설정
        CURRENT_ENV = "${getCurrentEnvironment()}"
        TARGET_ENV = "${getTargetEnvironment()}"
        
        TARGET_SUFFIX = "${TARGET_ENV}"
        TARGET_SERVER_PORT = "${TARGET_ENV == 'blue' ? '8080' : '8081'}"
        TARGET_CLIENT_PORT = "${TARGET_ENV == 'blue' ? '3000' : '3001'}"
        // 포트 설정
        // BLUE_SERVER_PORT = "8080"
        // GREEN_SERVER_PORT = "8081"
        // BLUE_CLIENT_PORT = "3000"
        // GREEN_CLIENT_PORT = "3001"
        // BLUE_NGINX_PORT = "80"
        // GREEN_NGINX_PORT = "8888"
    }

    stages {
        stage('Preparation') {
            steps {
                script {
                    echo "=== Blue-Green Deployment Started ==="
                    echo "Current Environment: ${CURRENT_ENV}"
                    echo "Target Environment: ${TARGET_ENV}"
                    
                    sh """
                        mkdir -p 
                    """
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Setup') {
            steps {
                script {
                    sh """
                        echo 'SERVER_PORT=${TARGET_SERVER_PORT}' > /home/ubuntu/ilchul/.env.${TARGET_SUFFIX}
                        echo 'MYSQL_DATABASE=ilchul_db' >> /home/ubuntu/ilchul/.env.${TARGET_SUFFIX}
                        echo 'MYSQL_USER=ilchul_user' >> /home/ubuntu/ilchul/.env.${TARGET_SUFFIX}
                        echo 'MYSQL_PASSWORD=${MYSQL_PASSWORD}' >> /home/ubuntu/ilchul/.env.${TARGET_SUFFIX}
                        echo 'MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}' >> /home/ubuntu/ilchul/.env.${TARGET_SUFFIX}
                        echo "=== .env.${TARGET_SUFFIX} file created ==="
                    """
                }
            }
        }

        stage('Create Docker Network') {
            steps {
                script {
                    sh '''
                        # Docker 네트워크 생성
                        docker network create app-network-blue 2>/dev/null || echo "Blue network already exists"
                        docker network create app-network-green 2>/dev/null || echo "Green network already exists"
                    '''
                }
            }
        }

        stage('Stop Target Environment') {
            steps {
                script {
                    sh """
                        echo "=== Stopping ${TARGET_ENV} environment containers ==="
                        docker stop mysql_db_${TARGET_SUFFIX} server_app_${TARGET_SUFFIX} client_app_${TARGET_SUFFIX} nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                        docker rm mysql_db_${TARGET_SUFFIX} server_app_${TARGET_SUFFIX} client_app_${TARGET_SUFFIX} nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                    """
                }
            }
        }

        stage('Deploy MySQL') {
            steps {
                script {
                    sh """
                        echo "=== Starting MySQL for ${TARGET_ENV} environment ==="
                        docker run -d \
                            --name mysql_db_${TARGET_SUFFIX} \
                            --network app-network-${TARGET_SUFFIX} \
                            -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                            -e MYSQL_DATABASE=ilchul_db \
                            -e MYSQL_USER=ilchul_user \
                            -e MYSQL_PASSWORD=${MYSQL_PASSWORD} \
                            -p 330${TARGET_ENV == 'blue' ? '6' : '7'}:3306 \
                            -v mysql_data_${TARGET_SUFFIX}:/var/lib/mysql \
                            --restart unless-stopped \
                            mysql:8.0
                        
                        echo "Waiting for MySQL to start..."
                        sleep 30
                        
                        # MySQL 연결 테스트
                        docker exec mysql_db_${TARGET_SUFFIX} mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} --silent
                    """
                }
            }
        }

        stage('Build and Deploy Server') {
            steps {
                script {
                    sh """
                        echo "=== Building Server for ${TARGET_ENV} environment ==="
                        cd /home/ubuntu/ilchul/backend
                        docker build -t server_app_${TARGET_SUFFIX} .
                        
                        echo "=== Starting Server ==="
                        docker run -d \
                            --name server_app_${TARGET_SUFFIX} \
                            --network app-network-${TARGET_SUFFIX} \
                            --env-file /home/ubuntu/ilchul/.env.${TARGET_SUFFIX} \
                            -e MYSQL_DRIVER=com.mysql.cj.jdbc.Driver \
                            -e MYSQL_URL=mysql_db_${TARGET_SUFFIX} \
                            -e MYSQL_PORT=3306 \
                            -e MYSQL_DATABASE=ilchul_db \
                            -e MYSQL_USER=ilchul_user \
                            -e MYSQL_PASSWORD=${MYSQL_PASSWORD} \
                            -e GOOGLE_API_KEY=${GOOGLE_API_KEY} \
                            -e OAUTH_GOOGLE_CLIENT_ID=${OAUTH_GOOGLE_CLIENT_ID} \
                            -e OAUTH_GOOGLE_CLIENT_SECRET=${OAUTH_GOOGLE_CLIENT_SECRET} \
                            -e OAUTH_GOOGLE_REDIRECT_URI=${OAUTH_GOOGLE_REDIRECT_URI} \
                            -e KAKAO_REST_API_KEY=${KAKAO_REST_API_KEY} \
                            -e OAUTH_KAKAO_CLIENT_SECRET=${OAUTH_KAKAO_CLIENT_SECRET} \
                            -e OAUTH_KAKAO_REDIRECT_URI=${OAUTH_KAKAO_REDIRECT_URI} \
                            -e OAUTH_NAVER_CLIENT_ID=${OAUTH_NAVER_CLIENT_ID} \
                            -e OAUTH_NAVER_CLIENT_SECRET=${OAUTH_NAVER_CLIENT_SECRET} \
                            -e OAUTH_NAVER_REDIRECT_URI=${OAUTH_NAVER_REDIRECT_URI} \
                            -e JWT_SECRET_KEY=${JWT_SECRET_KEY} \
                            -p ${TARGET_SERVER_PORT}:8080 \
                            --restart unless-stopped \
                            server_app_${TARGET_SUFFIX}
                        
                        sleep 15
                    """
                }
            }
        }

        stage('Build and Deploy Client') {
            steps {
                script {
                    sh """
                        echo "=== Building Client for ${TARGET_ENV} environment ==="
                        cd /home/ubuntu/ilchul/frontend
                        
                        # 환경별 API URL 설정
                        if [ "${TARGET_ENV}" = "blue" ]; then
                            export REACT_APP_API_URL=http://server_app_blue:8080
                        else
                            export REACT_APP_API_URL=http://server_app_green:8080
                        fi
                        
                        docker build -t client_app_${TARGET_SUFFIX} \
                            --build-arg REACT_APP_API_URL=\$REACT_APP_API_URL .
                        
                        echo "=== Starting Client ==="
                        docker run -d \
                            --name client_app_${TARGET_SUFFIX} \
                            --network app-network-${TARGET_SUFFIX} \
                            -e REACT_APP_API_URL=http://server_app_${TARGET_SUFFIX}:8080 \
                            -p ${TARGET_CLIENT_PORT}:3000 \
                            --restart unless-stopped \
                            client_app_${TARGET_SUFFIX}
                        
                        sleep 15
                    """
                }
            }
        }

        stage('Deploy Target Nginx') {
            steps {
                script {
                    sh """
                        echo "=== Creating Nginx config for ${TARGET_ENV} environment ==="
                        
                        # 타겟 환경용 Nginx 설정 파일 생성
                        cat > /home/ubuntu/ilchul/nginx/nginx_${TARGET_SUFFIX}.conf << 'EOF'
upstream backend_${TARGET_SUFFIX} {
    server server_app_${TARGET_SUFFIX}:8080;
}

upstream frontend_${TARGET_SUFFIX} {
    server client_app_${TARGET_SUFFIX}:3000;
}

server {
    listen 80;
    server_name il-chul.com;
    
    location /api/ {
        proxy_pass http://backend_${TARGET_SUFFIX}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        proxy_pass http://frontend_${TARGET_SUFFIX}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
                        
                        echo "=== Starting Nginx for ${TARGET_ENV} ==="
                        docker run -d \
                            --name nginx_server_${TARGET_SUFFIX} \
                            --network app-network-${TARGET_SUFFIX} \
                            -p ${TARGET_NGINX_PORT == '80' ? '8888' : '80'}:80 \
                            -v /home/ubuntu/ilchul/nginx/nginx_${TARGET_SUFFIX}.conf:/etc/nginx/nginx.conf:ro \
                            -v /home/ubuntu/ssl/certificate.crt:/etc/ssl/certs/certificate.crt:ro \
                            -v /home/ubuntu/ssl/private.key:/etc/ssl/certs/private.key:ro \
                            --restart unless-stopped \
                            nginx:alpine
                    """
                }
            }
        }

        stage('Health Check Target Environment') {
            steps {
                script {
                    sh """
                        echo "=== Health Check for ${TARGET_ENV} environment ==="
                        
                        # 서버 헬스체크
                        for i in {1..10}; do
                            if curl -f http://localhost:${TARGET_SERVER_PORT}/health 2>/dev/null; then
                                echo "✅ Server health check passed"
                                break
                            fi
                            echo "Waiting for server... attempt \$i/10"
                            sleep 10
                        done
                        
                        # 클라이언트 헬스체크
                        for i in {1..10}; do
                            if curl -f http://localhost:${TARGET_CLIENT_PORT} 2>/dev/null; then
                                echo "✅ Client health check passed"
                                break
                            fi
                            echo "Waiting for client... attempt \$i/10"
                            sleep 10
                        done
                        
                        # Nginx 헬스체크
                        TEST_PORT=\$([ "${TARGET_ENV}" = "blue" ] && echo "8888" || echo "80")
                        for i in {1..5}; do
                            if curl -f http://localhost:\$TEST_PORT 2>/dev/null; then
                                echo "✅ Nginx health check passed"
                                break
                            fi
                            echo "Waiting for nginx... attempt \$i/5"
                            sleep 5
                        done
                    """
                }
            }
        }

        stage('Switch Traffic (Blue-Green Switch)') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        input message: "새로운 ${TARGET_ENV} 환경이 준비되었습니다. 트래픽을 전환하시겠습니까?", 
                              ok: '트래픽 전환',
                              submitterParameter: 'APPROVER'
                    }
                    
                    sh """
                        echo "=== Switching traffic to ${TARGET_ENV} environment ==="
                        
                        # 현재 프로덕션 Nginx 중지
                        docker stop nginx_server 2>/dev/null || true
                        docker rm nginx_server 2>/dev/null || true
                        
                        # 새로운 환경을 프로덕션으로 승격
                        docker stop nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                        docker rm nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                        
                        # 프로덕션 Nginx 시작 (포트 80, 443)
                        docker run -d \
                            --name nginx_server \
                            --network app-network-${TARGET_SUFFIX} \
                            -p 80:80 \
                            -p 443:443 \
                            -v /home/ubuntu/ilchul/nginx/nginx_${TARGET_SUFFIX}.conf:/etc/nginx/nginx.conf:ro \
                            -v /home/ubuntu/ssl/certificate.crt:/etc/ssl/certs/certificate.crt:ro \
                            -v /home/ubuntu/ssl/private.key:/etc/ssl/certs/private.key:ro \
                            --restart unless-stopped \
                            nginx:alpine
                        
                        sleep 10
                        
                        # 환경 상태 업데이트
                        echo "${TARGET_ENV}" > /home/ubuntu/ilchul/current_environment.txt
                        
                        echo "✅ Traffic switched to ${TARGET_ENV} environment"
                    """
                }
            }
        }

        stage('Final Health Check') {
            steps {
                script {
                    sh '''
                        echo "=== Final Production Health Check ==="
                        
                        # 프로덕션 URL 테스트
                        for i in {1..5}; do
                            if curl -f http://il-chul.com 2>/dev/null; then
                                echo "✅ Production site is accessible"
                                break
                            fi
                            echo "Checking production site... attempt $i/5"
                            sleep 10
                        done
                        
                        docker ps --filter "name=nginx_server"
                        echo "🌐 Site is now live at http://il-chul.com"
                    '''
                }
            }
        }

        stage('Cleanup Old Environment') {
            steps {
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        try {
                            input message: "이전 환경을 정리하시겠습니까? (권장: 몇 시간 후 수동으로 정리)", 
                                  ok: '이전 환경 정리',
                                  submitterParameter: 'CLEANUP_APPROVER'
                            
                            sh """
                                echo "=== Cleaning up old environment ==="
                                OLD_ENV=\$([ "${TARGET_ENV}" = "blue" ] && echo "green" || echo "blue")
                                
                                docker stop mysql_db_\$OLD_ENV server_app_\$OLD_ENV client_app_\$OLD_ENV nginx_server_\$OLD_ENV 2>/dev/null || true
                                docker rm mysql_db_\$OLD_ENV server_app_\$OLD_ENV client_app_\$OLD_ENV nginx_server_\$OLD_ENV 2>/dev/null || true
                                
                                echo "✅ Old environment cleaned up"
                            """
                        } catch (Exception e) {
                            echo "⏭️ Skipping cleanup - you can manually clean up later"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh '''
                    echo "=== Current Environment Status ==="
                    docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                    
                    # 환경 상태 저장
                    if [ -f /home/ubuntu/ilchul/current_environment.txt ]; then
                        CURRENT=$(cat /home/ubuntu/ilchul/current_environment.txt)
                        echo "Active Environment: $CURRENT"
                    fi
                '''
                
                // 시스템 정리 (조심스럽게)
                sh 'docker image prune -f --filter "dangling=true" || true'
            }
        }
        success {
            echo "✅ Blue-Green deployment successful!"
            script {
                sh """
                    echo "🎉 Deployment completed successfully!"
                    echo "Current active environment: ${TARGET_ENV}"
                    echo "🌐 Site: http://il-chul.com"
                """
            }
        }
        failure {
            echo "❌ Blue-Green deployment failed!"
            script {
                sh """
                    echo "=== Deployment failed - Rolling back ==="
                    
                    # 타겟 환경 컨테이너 로그 출력
                    echo "=== Target Environment Logs ==="
                    docker logs mysql_db_${TARGET_SUFFIX} --tail 20 2>/dev/null || true
                    docker logs server_app_${TARGET_SUFFIX} --tail 20 2>/dev/null || true
                    docker logs client_app_${TARGET_SUFFIX} --tail 20 2>/dev/null || true
                    docker logs nginx_server_${TARGET_SUFFIX} --tail 20 2>/dev/null || true
                    
                    # 실패한 타겟 환경 정리
                    docker stop mysql_db_${TARGET_SUFFIX} server_app_${TARGET_SUFFIX} client_app_${TARGET_SUFFIX} nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                    docker rm mysql_db_${TARGET_SUFFIX} server_app_${TARGET_SUFFIX} client_app_${TARGET_SUFFIX} nginx_server_${TARGET_SUFFIX} 2>/dev/null || true
                    
                    echo "❌ Failed environment cleaned up"
                    echo "ℹ️ Previous environment remains active"
                """
            }
        }
    }
}

// 현재 활성 환경 확인 함수
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

// 타겟 환경 결정 함수 (현재와 반대)
def getTargetEnvironment() {
    def current = getCurrentEnvironment()
    return current == 'blue' ? 'green' : 'blue'
}
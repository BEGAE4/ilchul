pipeline {
    agent any

    environment {
        PROJECT_PATH = '/home/ubuntu/ilchul'
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
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "=== Checking out code ==="
                    checkout scm
                }
            }
        }

        stage('Preparation') {
            steps {
                script {
                    sh """
                        set -e  # Exit on error

                        echo "=== Preparation Stage ==="
                        echo "PROJECT_PATH: ${PROJECT_PATH}"
                        echo "Current directory: \$(pwd)"

                        cd ${PROJECT_PATH}
                        echo "Changed to: \$(pwd)"

                        # Create .env file with all credentials
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

                        # Initialize current_environment.txt if not exists or empty
                        if [ ! -f current_environment.txt ] || [ ! -s current_environment.txt ]; then
                            echo "blue" > current_environment.txt
                            echo "✅ Initialized current_environment.txt to blue"
                        else
                            echo "✅ current_environment.txt already exists: \$(cat current_environment.txt)"
                        fi

                        # Ensure nginx conf.d directory exists
                        mkdir -p nginx/conf.d
                        echo "✅ nginx/conf.d directory ensured"

                        # Verify critical files
                        echo ""
                        echo "=== Verification ==="
                        echo "current_environment.txt exists: \$(test -f current_environment.txt && echo YES || echo NO)"
                        echo "current_environment.txt content: '\$(cat current_environment.txt 2>/dev/null || echo EMPTY)'"
                        echo "current_environment.txt size: \$(wc -c < current_environment.txt 2>/dev/null || echo 0) bytes"
                    """
                }
            }
        }

        stage('Create Docker Network') {
            steps {
                script {
                    sh '''
                        docker network create app-network 2>/dev/null || echo "Network already exists"
                    '''
                }
            }
        }

        stage('Start MySQL') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        # Check if MySQL is already running
                        if docker ps --format '{{.Names}}' | grep -q '^mysql_db\$'; then
                            echo "MySQL is already running"
                        else
                            echo "=== Starting MySQL ==="
                            docker compose up -d mysql

                            echo "Waiting for MySQL to be healthy..."
                            for i in {1..30}; do
                                if docker exec mysql_db mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} 2>/dev/null; then
                                    echo "✅ MySQL is healthy"
                                    break
                                fi
                                echo "Waiting for MySQL... (\$i/30)"
                                sleep 2
                            done
                        fi
                    """
                }
            }
        }

        stage('Determine Environment') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        # Ensure current_environment.txt exists with default value
                        if [ ! -f current_environment.txt ] || [ ! -s current_environment.txt ]; then
                            echo "⚠️ current_environment.txt not found or empty, initializing to blue"
                            echo "blue" > current_environment.txt
                        fi

                        # Read current active environment
                        CURRENT_ENV=\$(cat current_environment.txt | tr -d '[:space:]')

                        # Validate CURRENT_ENV
                        if [ -z "\$CURRENT_ENV" ]; then
                            echo "❌ CURRENT_ENV is empty, defaulting to blue"
                            CURRENT_ENV="blue"
                            echo "blue" > current_environment.txt
                        fi

                        echo "Current active environment: \$CURRENT_ENV"

                        # Determine target environment (opposite of current)
                        if [ "\$CURRENT_ENV" = "blue" ]; then
                            TARGET_ENV="green"
                        else
                            TARGET_ENV="blue"
                        fi

                        echo "Target deployment environment: \$TARGET_ENV"

                        # Save to files
                        echo "\$TARGET_ENV" > target_environment.txt
                        echo "\$CURRENT_ENV" > previous_environment.txt

                        # Verify files were created
                        echo "=== Verification ==="
                        echo "target_environment.txt: \$(cat target_environment.txt)"
                        echo "previous_environment.txt: \$(cat previous_environment.txt)"
                    """

                    env.TARGET_ENV = sh(script: "cat ${PROJECT_PATH}/target_environment.txt | tr -d '[:space:]'", returnStdout: true).trim()
                    env.CURRENT_ENV = sh(script: "cat ${PROJECT_PATH}/previous_environment.txt | tr -d '[:space:]'", returnStdout: true).trim()

                    echo "=== Environment Variables Set ==="
                    echo "Deploying to: ${env.TARGET_ENV}"
                    echo "Currently active: ${env.CURRENT_ENV}"

                    // Validate environment variables
                    if (!env.TARGET_ENV || env.TARGET_ENV == '' || env.TARGET_ENV == 'null') {
                        error("❌ TARGET_ENV is not set properly: ${env.TARGET_ENV}")
                    }
                    if (!env.CURRENT_ENV || env.CURRENT_ENV == '' || env.CURRENT_ENV == 'null') {
                        error("❌ CURRENT_ENV is not set properly: ${env.CURRENT_ENV}")
                    }
                }
            }
        }

        stage('Build Target Environment') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        echo "=== Building ${TARGET_ENV} environment ==="
                        docker compose -f docker compose.yml -f docker compose.${TARGET_ENV}.yml build --no-cache
                    """
                }
            }
        }

        stage('Deploy Target Environment') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        echo "=== Starting ${TARGET_ENV} environment ==="
                        docker compose -f docker compose.yml -f docker compose.${TARGET_ENV}.yml up -d

                        echo "Waiting for services to initialize..."
                        sleep 10
                    """
                }
            }
        }

        stage('Health Check Target') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        # Determine ports based on target environment
                        if [ "${TARGET_ENV}" = "blue" ]; then
                            BACKEND_PORT=8080
                            FRONTEND_PORT=3000
                        else
                            BACKEND_PORT=8081
                            FRONTEND_PORT=3001
                        fi

                        echo "=== Health checking ${TARGET_ENV} environment ==="
                        echo "Backend port: \$BACKEND_PORT"
                        echo "Frontend port: \$FRONTEND_PORT"

                        # Wait for backend health
                        echo "Checking backend health..."
                        for i in {1..30}; do
                            if curl -f http://localhost:\$BACKEND_PORT/health 2>/dev/null; then
                                echo "✅ Backend is healthy"
                                break
                            fi
                            if [ \$i -eq 30 ]; then
                                echo "❌ Backend health check failed"
                                docker logs backend_${TARGET_ENV}_1 --tail 50
                                exit 1
                            fi
                            echo "Waiting for backend... (\$i/30)"
                            sleep 3
                        done

                        # Wait for frontend health
                        echo "Checking frontend health..."
                        for i in {1..20}; do
                            if curl -f http://localhost:\$FRONTEND_PORT 2>/dev/null; then
                                echo "✅ Frontend is healthy"
                                break
                            fi
                            if [ \$i -eq 20 ]; then
                                echo "❌ Frontend health check failed"
                                docker logs client_app_${TARGET_ENV} --tail 50
                                exit 1
                            fi
                            echo "Waiting for frontend... (\$i/20)"
                            sleep 3
                        done

                        echo "✅ ${TARGET_ENV} environment is healthy and ready!"
                    """
                }
            }
        }

        stage('Start Nginx') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        # Check if Nginx is already running
                        if docker ps --format '{{.Names}}' | grep -q '^nginx_server\$'; then
                            echo "Nginx is already running"
                        else
                            echo "=== Starting Nginx ==="

                            # Initialize symlinks to blue (default)
                            docker compose -f docker compose.nginx.yml up -d

                            sleep 3

                            # Set initial symlinks to current active environment
                            docker exec nginx_server ln -sf /etc/nginx/conf.d/active-backend-${CURRENT_ENV}.conf /etc/nginx/conf.d/active-backend.conf
                            docker exec nginx_server ln -sf /etc/nginx/conf.d/active-frontend-${CURRENT_ENV}.conf /etc/nginx/conf.d/active-frontend.conf
                            docker exec nginx_server nginx -s reload

                            echo "✅ Nginx started with ${CURRENT_ENV} environment"
                        fi
                    """
                }
            }
        }

        stage('Manual Approval') {
            steps {
                script {
                    echo """
==================================================
🚀 READY TO SWITCH TRAFFIC
==================================================
Current active: ${env.CURRENT_ENV}
Target environment: ${env.TARGET_ENV}

The new ${env.TARGET_ENV} environment is healthy and ready.

✅ Backend (${env.TARGET_ENV}): http://localhost:${env.TARGET_ENV == 'blue' ? '8080' : '8081'}/health
✅ Frontend (${env.TARGET_ENV}): http://localhost:${env.TARGET_ENV == 'blue' ? '3000' : '3001'}

Click 'Proceed' to switch traffic to ${env.TARGET_ENV}
==================================================
"""
                    input message: "Switch traffic to ${env.TARGET_ENV}?", ok: 'Proceed'
                }
            }
        }

        stage('Switch Traffic') {
            steps {
                script {
                    sh """
                        cd ${PROJECT_PATH}

                        echo "=== Switching traffic to ${TARGET_ENV} ==="

                        # Update symlinks inside nginx container
                        docker exec nginx_server ln -sf /etc/nginx/conf.d/active-backend-${TARGET_ENV}.conf /etc/nginx/conf.d/active-backend.conf
                        docker exec nginx_server ln -sf /etc/nginx/conf.d/active-frontend-${TARGET_ENV}.conf /etc/nginx/conf.d/active-frontend.conf

                        # Graceful reload (zero downtime)
                        docker exec nginx_server nginx -s reload

                        # Update current environment marker
                        echo "${TARGET_ENV}" > current_environment.txt

                        echo "✅ Traffic switched to ${TARGET_ENV}"
                        echo "Active environment is now: ${TARGET_ENV}"
                    """
                }
            }
        }

        stage('Final Health Check') {
            steps {
                script {
                    sh """
                        echo "=== Final production health check ==="
                        sleep 3

                        # Check production URL
                        if curl -f http://il-chul.com 2>/dev/null; then
                            echo "✅ Production site is accessible"
                        else
                            echo "⚠️ Production site check failed"
                            exit 1
                        fi

                        if curl -f http://il-chul.com/api/health 2>/dev/null; then
                            echo "✅ Production API is healthy"
                        else
                            echo "⚠️ Production API health check failed"
                            exit 1
                        fi

                        echo ""
                        echo "🎉 Deployment successful!"
                        echo "✅ Active environment: ${TARGET_ENV}"
                        echo "🌐 Site: https://il-chul.com"
                        echo ""
                        echo "💡 Previous ${CURRENT_ENV} environment is still running for quick rollback"
                    """
                }
            }
        }

        stage('Cleanup Old Environment (Optional)') {
            steps {
                script {
                    try {
                        timeout(time: 5, unit: 'MINUTES') {
                            input message: "Stop the old ${env.CURRENT_ENV} environment? (Recommended to wait a while)", ok: 'Stop Old Environment'

                            sh """
                                cd ${PROJECT_PATH}

                                echo "=== Stopping old ${CURRENT_ENV} environment ==="
                                docker compose -f docker compose.yml -f docker compose.${CURRENT_ENV}.yml down

                                echo "✅ Old ${CURRENT_ENV} environment stopped"
                                echo "💡 You can still rollback by running ./rollback.sh on the server"
                            """
                        }
                    } catch (Exception e) {
                        echo "Keeping old ${env.CURRENT_ENV} environment running"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Only run if PROJECT_PATH is available (pipeline progressed past initialization)
                if (env.PROJECT_PATH) {
                    sh """
                        cd ${env.PROJECT_PATH}

                        echo "=== Container Status ==="
                        docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

                        echo ""
                        echo "=== Active Environment ==="
                        if [ -f current_environment.txt ]; then
                            cat current_environment.txt
                        else
                            echo "current_environment.txt not found"
                        fi

                        # Cleanup
                        docker system prune -f || true
                    """
                } else {
                    echo "Pipeline failed during initialization. Skipping cleanup."
                }
            }
        }
        success {
            script {
                def targetEnv = env.TARGET_ENV ?: 'unknown'
                def currentEnv = env.CURRENT_ENV ?: 'unknown'

                echo """
==================================================
✅ DEPLOYMENT SUCCESSFUL
==================================================
Active environment: ${targetEnv}
Previous environment: ${currentEnv} (still running for rollback)

🌐 Site: https://il-chul.com

To rollback: ssh to server and run ./rollback.sh
==================================================
"""
            }
        }
        failure {
            script {
                def targetEnv = env.TARGET_ENV ?: 'unknown'
                def currentEnv = env.CURRENT_ENV ?: 'unknown'

                echo """
==================================================
❌ DEPLOYMENT FAILED
==================================================
Target environment: ${targetEnv}
Active environment: ${currentEnv} (unchanged)

Your previous ${currentEnv} environment is still active.
No traffic was switched. No downtime occurred.
==================================================
"""

                // Only try to cleanup if TARGET_ENV and PROJECT_PATH were set
                if (env.PROJECT_PATH && env.TARGET_ENV && env.TARGET_ENV != 'null' && env.TARGET_ENV != 'unknown') {
                    sh """
                        cd ${env.PROJECT_PATH}

                        echo "=== Failure Investigation ==="
                        echo "Target environment logs (${env.TARGET_ENV}):"
                        docker compose -f docker compose.yml -f docker compose.${env.TARGET_ENV}.yml logs --tail 50 || true

                        echo ""
                        echo "Cleaning up failed ${env.TARGET_ENV} environment..."
                        docker compose -f docker compose.yml -f docker compose.${env.TARGET_ENV}.yml down || true
                    """
                } else {
                    echo "⚠️ Pipeline failed during initialization - skipping environment cleanup"
                    echo "💡 Check Jenkins credentials and configuration"
                    if (!env.PROJECT_PATH) {
                        echo "   - PROJECT_PATH not available (pipeline failed early)"
                    }
                    if (!env.TARGET_ENV || env.TARGET_ENV == 'null' || env.TARGET_ENV == 'unknown') {
                        echo "   - TARGET_ENV not set (pipeline failed before 'Determine Environment' stage)"
                    }
                }
            }
        }
    }
}

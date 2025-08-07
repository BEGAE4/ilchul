pipeline {
    agent any

    environment {
        MYSQL_PASSWORD = credentials('mysql-password')
        MYSQL_ROOT_PASSWORD = credentials('mysql-root-password')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Setup') {
            steps {
                script {
                    sh """
                        echo 'SERVER_PORT=8080' > /home/ubuntu/ilchul/.env
                        echo 'MYSQL_DATABASE=ilchul_db' >> /home/ubuntu/ilchul/.env
                        echo 'MYSQL_USER=ilchul_user' >> /home/ubuntu/ilchul/.env
                        echo 'MYSQL_PASSWORD=${MYSQL_PASSWORD}' >> /home/ubuntu/ilchul/.env
                        echo 'MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}' >> /home/ubuntu/ilchul/.env
                        
                        echo "=== .env file created ==="
                    """
                }
            }
        }

        stage('Create Docker Network') {
            steps {
                script {
                    sh '''
                        # Docker 네트워크 생성
                        docker network create app-network 2>/dev/null || echo "Network already exists"
                    '''
                }
            }
        }

        stage('Stop Previous Containers') {
            steps {
                script {
                    sh '''
                        echo "=== Stopping previous containers ==="
                        docker stop mysql_db server_app client_app nginx_server 2>/dev/null || true
                        docker rm mysql_db server_app client_app nginx_server 2>/dev/null || true
                        docker container prune -f
                    '''
                }
            }
        }

        stage('Deploy MySQL') {
            steps {
                script {
                    sh '''
                        echo "=== Starting MySQL ==="
                        docker run -d \
                            --name mysql_db \
                            --network app-network \
                            -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                            -e MYSQL_DATABASE=ilchul_db \
                            -e MYSQL_USER=ilchul_user \
                            -e MYSQL_PASSWORD=${MYSQL_PASSWORD} \
                            -p 3306:3306 \
                            -v mysql_data:/var/lib/mysql \
                            --restart unless-stopped \
                            mysql:8.0
                        
                        echo "Waiting for MySQL to start..."
                        sleep 20
                    '''
                }
            }
        }

        stage('Build and Deploy Server') {
            steps {
                script {
                    sh '''
                        echo "=== Building Server ==="
                        cd /home/ubuntu/ilchul/backend
                        docker build -t server_app .
                        
                        echo "=== Starting Server ==="
                        docker run -d \
                            --name server_app \
                            --network app-network \
                            -e MYSQL_HOST=mysql_db \
                            -e MYSQL_PORT=3306 \
                            -e MYSQL_DATABASE=ilchul_db \
                            -e MYSQL_USER=ilchul_user \
                            -e MYSQL_PASSWORD=${MYSQL_PASSWORD} \
                            -p 8080:8080 \
                            --restart unless-stopped \
                            server_app
                        
                        sleep 10
                    '''
                }
            }
        }

        stage('Build and Deploy Client') {
            steps {
                script {
                    sh '''
                        echo "=== Building Client ==="
                        cd /home/ubuntu/ilchul/frontend
                        docker build -t client_app .
                        
                        echo "=== Starting Client ==="
                        docker run -d \
                            --name client_app \
                            --network app-network \
                            -e REACT_APP_API_URL=http://server_app:8080 \
                            -p 3000:3000 \
                            --restart unless-stopped \
                            client_app
                        
                        sleep 10
                    '''
                }
            }
        }

        stage('Deploy Nginx') {
            steps {
                script {
                    sh '''
                        echo "=== Starting Nginx ==="
                        
                        # nginx.conf 파일이 있다면 volume mount, 없으면 기본 설정 사용
                        if [ -f /home/ubuntu/ilchul/nginx/nginx.conf ]; then
                            docker run -d \
                                --name nginx_server \
                                --network app-network \
                                -p 80:80 \
                                -p 443:443 \
                                -v /home/ubuntu/ilchul/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
                                --restart unless-stopped \
                                nginx:alpine
                        else
                            docker run -d \
                                --name nginx_server \
                                --network app-network \
                                -p 80:80 \
                                -p 443:443 \
                                --restart unless-stopped \
                                nginx:alpine
                        fi
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                        echo "=== Checking container status ==="
                        docker ps
                        
                        echo "=== Health check ==="
                        MAX_RETRIES=30
                        RETRY_COUNT=0
                        
                        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
                            echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES"
                            
                            # Port check
                            if nc -zv localhost 80 2>/dev/null; then
                                echo "✓ Nginx port is open"
                                echo "✅ Deployment successful!"
                                docker ps
                                exit 0
                            fi
                            
                            RETRY_COUNT=$((RETRY_COUNT + 1))
                            sleep 10
                        done
                        
                        echo "❌ Health check failed"
                        docker ps -a
                        exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
            script {
                sh '''
                    echo "=== Container logs ==="
                    docker logs mysql_db --tail 30 2>/dev/null || true
                    docker logs server_app --tail 30 2>/dev/null || true
                    docker logs client_app --tail 30 2>/dev/null || true
                    docker logs nginx_server --tail 30 2>/dev/null || true
                '''
            }
        }
    }
}
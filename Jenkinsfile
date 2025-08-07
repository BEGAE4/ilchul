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

        stage('Check Docker & Install Compose') {
            steps {
                script {
                    sh '''
                        echo "=== Checking Docker version ==="
                        docker --version
                        
                        echo "=== Installing Docker Compose standalone ==="
                        # Docker Compose standalone 설치
                        sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                        sudo chmod +x /usr/local/bin/docker-compose
                        
                        # 심볼릭 링크 생성 (docker compose 명령어로도 사용 가능하도록)
                        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
                        
                        echo "=== Docker Compose version ==="
                        docker-compose --version || echo "docker-compose not found"
                    '''
                }
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
                        echo 'MYSQL_PORT=3306' >> /home/ubuntu/ilchul/.env
                        echo 'NGINX_HTTP_PORT=80' >> /home/ubuntu/ilchul/.env
                        echo 'NGINX_HTTPS_PORT=443' >> /home/ubuntu/ilchul/.env
                        echo 'CLIENT_PORT=3000' >> /home/ubuntu/ilchul/.env
                        
                        echo "=== .env file created ==="
                        cat /home/ubuntu/ilchul/.env || echo "Cannot read .env file"
                    """
                }
            }
        }

        stage('Stop Previous Deployment') {
            steps {
                script {
                    sh '''
                        cd /home/ubuntu/ilchul
                        # Docker Compose V2 사용 (하이픈 없음)
                        docker compose down || true
                        
                        # 기존 컨테이너 정리
                        docker container prune -f
                    '''
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    sh '''
                        echo "=== Starting deployment with Docker Compose V2 ==="
                        cd /home/ubuntu/ilchul
                        
                        # Docker Compose V2 명령어 사용
                        docker compose up --build -d
                        
                        echo "=== Waiting for containers to start ==="
                        sleep 30
                        
                        echo "=== Checking running containers ==="
                        docker compose ps
                        
                        echo "=== Checking application logs ==="
                        docker compose logs --tail=20
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                        cd /home/ubuntu/ilchul
                        
                        # 컨테이너 상태 확인
                        docker compose ps
                        
                        # 서비스 헬스체크
                        echo "=== Checking service health ==="
                        for i in {1..30}; do
                            if curl -f http://localhost:80 2>/dev/null; then
                                echo "✓ Nginx is healthy"
                                
                                if curl -f http://localhost:3000 2>/dev/null; then
                                    echo "✓ Client is healthy"
                                fi
                                
                                if curl -f http://localhost:8080/health 2>/dev/null; then
                                    echo "✓ Server is healthy"
                                fi
                                
                                echo "Application is running successfully!"
                                exit 0
                            fi
                            echo "Attempt $i/30: Waiting for application to start..."
                            sleep 10
                        done
                        
                        echo "=== Health check failed, showing detailed status ==="
                        docker compose ps
                        docker compose logs --tail=50
                        exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                sh '''
                    echo "=== Cleanup ==="
                    docker system prune -f
                '''
            }
        }
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
            script {
                sh '''
                    cd /home/ubuntu/ilchul
                    echo "=== Showing error logs ==="
                    docker compose logs --tail=100
                    
                    echo "=== Stopping containers ==="
                    docker compose down || true
                '''
            }
        }
    }
}
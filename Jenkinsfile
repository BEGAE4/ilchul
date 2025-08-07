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
                        if [ -f docker compose.yml ]; then
                            docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v /home/ubuntu/ilchul:/workspace \
                            -w /workspace \
                            docker/compose:latest down || true
                        fi
                    '''
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    sh '''
                        echo "=== Starting deployment with docker/compose image ==="
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v /home/ubuntu/ilchul:/workspace \
                          -w /workspace \
                          docker/compose:latest up --build -d
                        
                        echo "=== Waiting for containers to start ==="
                        sleep 60
                        
                        echo "=== Checking running containers ==="
                        docker ps
                        
                        echo "=== Checking application containers ==="
                        docker logs nginx_server 2>&1 | tail -10 || echo "nginx not running"
                        docker logs client_app 2>&1 | tail -10 || echo "client not running" 
                        docker logs server_app 2>&1 | tail -10 || echo "server not running"
                        docker logs mysql_db 2>&1 | tail -10 || echo "mysql not running"
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                        for i in {1..30}; do
                            if curl -f http://localhost:80; then
                                echo "Application is healthy"
                                exit 0
                            fi
                            echo "Waiting for application to start..."
                            sleep 10
                        done
                        echo "=== Health check failed, showing container status ==="
                        docker ps
                        echo "Health check failed"
                        exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v /home/ubuntu/ilchul:/workspace \
                  -w /workspace \
                  docker/compose:latest down || true
            '''
        }
    }
}

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
                    writeFile file: '/home/ubuntu/jenkins/.env', text: """
                        SERVER_PORT=8080
                        MYSQL_DATABASE=ilchul_db
                        MYSQL_USER=ilchul_user
                        MYSQL_PASSWORD=${MYSQL_PASSWORD}
                        MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
                        MYSQL_PORT=3306
                        NGINX_HTTP_PORT=80
                        NGINX_HTTPS_PORT=443
                        CLIENT_PORT=3000
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
                            docker/compose:v2.20.0 down || true
                        fi
                    '''
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    sh '''
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v /home/ubuntu/ilchul:/workspace \
                            -w /workspace \
                            docker/compose:v2.20.0 up --build -d

                        sllep 30
                        
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            -v /home/ubuntu/ilchul:/workspace \
                            -w /workspace \
                            docker/compose:v2.20.0 ps
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
                    docker/compose:v2.20.0 down

            '''
        }
    }
}

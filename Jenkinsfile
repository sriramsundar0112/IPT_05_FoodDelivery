pipeline{
    agent 
    {
        label 'host-agent'
    }

    
    environment {
        AWS_REGION = "us-east-2"
        ACCOUNT_ID = "982614288416"
        ECR_REPO_BACKEND = "food-delivery-backend"
        ECR_REPO_FRONTEND = "food-delivery-frontend"
        ECR_REPO_ADMIN = "food-delivery-admin"
    }

    stages{
        stage('Validate Agent')
        {
            steps
            {
               sh 'hostname'
			   sh 'whoami'
			   sh 'pwd'
               sh 'aws --version'
             
            }
        }

        stage('SonarQube Code Analysis'){
		steps{
            withSonarQubeEnv('sonarserver') {
                sh '''
                     /opt/sonar-scanner-8.1.0.6389-linux-x64/bin/sonar-scanner \
                     -Dsonar.projectBaseDir=. \
                     -Dsonar.sources=. \
                     -Dsonar.projectKey=sonarqube-Jenkins:$BUILD_NUMBER-$BUILD_ID \
                     -Dsonar.projectName=sonarqube-jenkins:$BUILD_NUMBER-$BUILD_ID \

                    '''
              }
            }
                
            }
        
        stage('Login to ECR')
        {
            steps
            {
                withCredentials([
                    string(credentialsId: 'AWS-ECR-AccessKey', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS-ECR-SecretKey', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {

                    sh '''
                    export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                    export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

                    aws ecr get-login-password \
                      --region $AWS_REGION | \
                    docker login \
                      --username AWS \
                      --password-stdin \
                      $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
                    '''
                }
            }
        }

        // Backend - Build, Scan and Push

        stage ('Build & Scan Food Delivery Backend Image')
        {
            steps
            {
                sh '''
                cd ./backend
                docker build -t food-del-backend:$BUILD_NUMBER .
                docker compose -f ../docker-compose.yml run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report_backend.json food-del-backend:$BUILD_NUMBER
                '''
            }
        }

        stage ('Push Food Delivery Backend Image to ECR')
        {
            steps
            {
                sh '''
                docker build -t food-del-backend:$BUILD_NUMBER .
                docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:$BUILD_NUMBER
				docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
                cd ..
                '''
            }
        }



        // Frontend - Build, Scan and Push

        stage ('Build & Scan Food Delivery Frontend Image')
        {
            steps
            {
                sh '''
                cd ./frontend
                docker build -t food-del-frontend:$BUILD_NUMBER .
                docker compose -f ../docker-compose.yml run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report_frontend.json food-del-frontend:$BUILD_NUMBER
                '''
            }
        }

        stage ('Push Food Delivery Frontend Image to ECR')
        {
            steps
            {
                sh '''
                docker build -t food-del-frontend:$BUILD_NUMBER .
                docker tag food-del-frontend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:$BUILD_NUMBER
				docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
                cd ..
                '''
            }
        }

        // Admin - Build, Scan and Push

        stage ('Build & Scan Food Admin Frontend Image')
        {
            steps
            {
                sh '''
                cd ./admin
                docker build -t food-del-admin:$BUILD_NUMBER .
                docker compose -f ../docker-compose.yml run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report_admin.json food-del-admin:$BUILD_NUMBER

                '''
            }
        }

        stage ('Push Food Delivery Admin Image to ECR')
        {
            steps
            {
                sh '''
                docker build -t food-del-admin:$BUILD_NUMBER .
                docker tag food-del-admin:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:$BUILD_NUMBER
				docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:latest
                cd ..
                '''
            }
        }

            

    }

    post
            {
                always
                {
                    emailext attachLog: true, body: '''<html>
                                    <body>
                                    <h1>Jenkins Build Notification: ${PROJECT_NAME} - Build #${BUILD_NUMBER}</h1>
                                    <p>Status: <b>${BUILD_STATUS}</b></p>
                                    <p>Check the build details here: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                                    </body>
                                    </html>''', mimeType: 'text/html', subject: 'Build Notification: ${PROJECT_NAME} - Build #${BUILD_NUMBER} - Status : ${BUILD_STATUS}', to: 'sriram.sundaramoorthy@gmail.com'
                }
            }

}

def printTrivySummary(String reportFile) {
    sh """
        set +x
        HIGH=\$(jq '[.Results[].Vulnerabilities[]? | select(.Severity=="HIGH")] | length' ${reportFile})
        CRITICAL=\$(jq '[.Results[].Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length' ${reportFile})
        TOTAL=\$((HIGH + CRITICAL))

        echo "==================================="
        echo "Trivy Vulnerability Summary"
        echo "HIGH     : \$HIGH"
        echo "CRITICAL : \$CRITICAL"
        echo "TOTAL    : \$TOTAL"
        echo "==================================="

        if [ "\$TOTAL" -gt 0 ]; then
            echo "SECURITY SCAN FAILED"
            echo "See ${reportFile} for details"
        else
            echo "No HIGH/CRITICAL vulnerabilities found"
        fi
        set -x
    """
}

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
                docker build --pull -t food-del-backend:$BUILD_NUMBER .
				'''
				script 
				{
					int trivyExitCode = sh(
						script: '''
                                docker compose run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report-backend.json food-del-backend:$BUILD_NUMBER
					           ''',
						returnStatus: true
						)
                           
						printTrivySummary('trivy-report-backend.json')
						if (trivyExitCode != 0) 
						{
							error('HIGH/CRITICAL vulnerabilities detected')
						}
								
				}
			}
		}

        stage ('Push Food Delivery Backend Image to ECR')
        {
            steps
            {
                sh '''
                docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:$BUILD_NUMBER
				docker tag food-del-backend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
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
                docker build --pull -t food-del-frontend:$BUILD_NUMBER .
				'''
				script 
				{
					int trivyExitCode = sh(
						script: '''
                                docker compose run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report-frontend.json food-del-frontend:$BUILD_NUMBER
					           ''',
						returnStatus: true
						)
                           
						printTrivySummary('trivy-report-frontend.json')
						if (trivyExitCode != 0) 
						{
							error('HIGH/CRITICAL vulnerabilities detected')
						}
								
				}
			}
		}
        stage ('Push Food Delivery Frontend Image to ECR')
        {
            steps
            {
                sh '''
                docker tag food-del-frontend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:$BUILD_NUMBER
				docker tag food-del-frontend:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
                '''
            }
        }

        // Admin - Build, Scan and Push

    stage ('Build & Scan Food Delivery Admin Image')
        {
            steps
            {
                sh '''
                cd ./admin
                docker build --pull -t food-del-admin:$BUILD_NUMBER .
				'''
				script 
				{
					int trivyExitCode = sh(
						script: '''
                                docker compose run --rm -v $(pwd):/workspace trivy image --severity HIGH,CRITICAL --exit-code 1 --format json -o /workspace/trivy-report-admin.json food-del-admin:$BUILD_NUMBER
					           ''',
						returnStatus: true
						)
                           
						printTrivySummary('trivy-report-admin.json')
						if (trivyExitCode != 0) 
						{
							error('HIGH/CRITICAL vulnerabilities detected')
						}
								
				}
			}
		}

        stage ('Push Food Delivery Admin Image to ECR')
        {
            steps
            {
                sh '''
                docker tag food-del-admin:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:$BUILD_NUMBER
                docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:$BUILD_NUMBER
				docker tag food-del-admin:$BUILD_NUMBER $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:latest
				docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_ADMIN:latest
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

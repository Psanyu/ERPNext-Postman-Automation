pipeline {
    agent any

    stages {
        stage('Install Newman') {
            steps {
                bat 'npm ci'
                bat 'npx newman --version'
            }
        }

        stage('ERPNext REST API Tests') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'erpnext-oauth-token',
                        variable: 'ERP_TOKEN'
                    )
                ]) {
                    bat '''
                    if not exist reports mkdir reports

                    npx newman run "ERPNext OAuth2 Practice.postman_collection.json" ^
                      --env-var "baseUrl=http://localhost:8000" ^
                      --env-var "accessToken=%ERP_TOKEN%" ^
                      --folder "03 - POST New Auth" ^
                      --folder "04 - Get Customer By Name" ^
                      --folder "05 - Update Customer" ^
                      --folder "06 - Delete Customer" ^
                      --folder "07 - Verify Deleted Customer" ^
                      --folder "08 - POST Customer Missing Required Field" ^
                      --folder "09 - GET Customers Without Token" ^
                      --folder "10 - GET Customers Invalid Token" ^
                      --reporters cli,junit ^
                      --reporter-junit-export "reports/newman-results.xml"
                    '''
                }
            }
        }

        stage('Push Test Report to GitHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-erpnext-push',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    bat '''
                    git config user.name "Jenkins"
                    git config user.email "jenkins@localhost"

                    git add -f reports/newman-results.xml

                    git diff --cached --quiet
                    if errorlevel 1 (
                        git commit -m "Update Newman API test results - Jenkins build %BUILD_NUMBER%"
                        git push https://%GIT_USER%:%GIT_TOKEN%@github.com/Psanyu/ERPNext-Postman-Automation.git HEAD:main
                    ) else (
                        echo No report changes to commit.
                    )
                    '''
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true,
                  testResults: 'reports/newman-results.xml'

            archiveArtifacts artifacts: 'reports/newman-results.xml',
                             allowEmptyArchive: true
        }
    }
}
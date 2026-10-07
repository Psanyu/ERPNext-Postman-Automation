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
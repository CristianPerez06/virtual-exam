require('dotenv').config()

module.exports = {
  db: process.env.DB,
  port: process.env.PORT,
  connection: process.env.CONNECTION_URL,
  defaultConnection: process.env.DEFAULT_CONNECTION_URL,
  cognitoRegion: process.env.COGNITO_REGION,
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.COGNITO_CLIENT_ID
}

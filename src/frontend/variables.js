const variables = {
  cognitoRegion: process.env.REACT_APP_COGNITO_REGION,
  cognitoUserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  cognitoClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  cognitoAccessKey: process.env.REACT_APP_COGNITO_ACCESS_KEY,
  cognitoSecretKey: process.env.REACT_APP_COGNITO_SECRET_ACCESS_KEY,
  bucketS3Name: process.env.REACT_APP_COGNITO_BUCKET_S3_NAME,
  bucketS3Region: process.env.REACT_APP_COGNITO_BUCKET_S3_REGION,
  api: process.env.REACT_APP_API
}

export default variables

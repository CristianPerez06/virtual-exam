# virtual-exam
Virtual exam is an app that allows students to take their exams online. 

## Tech stack
- ReactJS
- Bootstrap
- AWS Cognito
- GraphQL
- Apollo Client 3
- NodeJS
- ExpressJS
- Apollo Server 2
- MongoDB

## Installation

1. Rename the `.env.file` inside root folder to `.env` and fill the empty values:

```
# ------ SERVER ------ 
DB=virtual-exam
COGNITO_CLIENT_ID=
COGNITO_REGION=
COGNITO_USER_POOL_ID=

# only for dev
DEFAULT_CONNECTION_URL=
# only for prod
# CONNECTION_URL=

# ------ CLIENT ------
REACT_APP_COGNITO_ACCESS_KEY=
REACT_APP_COGNITO_CLIENT_ID=
REACT_APP_COGNITO_REGION=
REACT_APP_COGNITO_SECRET_ACCESS_KEY=
REACT_APP_COGNITO_USER_POOL_ID=
REACT_APP_COGNITO_BUCKET_S3_NAME=
REACT_APP_COGNITO_BUCKET_S3_REGION=

#prod
#REACT_APP_API=/graphql
#dev
REACT_APP_API=http://localhost:4000/graphql
```
 
3. Go to root folder
4. type `npm install`
5. Run the server: type `npm run back`
6. Run the client: type `npm run front`

## Live app
https://virtual-exam-ucel.herokuapp.com


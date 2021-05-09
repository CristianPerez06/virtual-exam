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

1. Create an .env file inside app folder with following structure and complete with corresponding values:
  ```
  REACT_APP_COGNITO_REGION=xx-xxxx-x
  REACT_APP_COGNITO_USER_POOL_ID=xx-xxxx-x_xxxxxxxxx
  REACT_APP_COGNITO_CLIENT_ID=xxxx....
  REACT_APP_COGNITO_ACCESS_KEY=xxxx....
  REACT_APP_COGNITO_SECRET_ACCESS_KEY=xxxx....
  ```
 
2. Create an .env file inside server folder with following structure and complete with corresponding values:
  ```
  CONNECTION=mongodb+srv://xxxx....
  DB=virtual-exam
  COGNITO_REGION=xx-xxxx-x
  COGNITO_USER_POOL_ID=xx-xxxx-x_xxxxxxxxx
  COGNITO_CLIENT_ID=xxxx....
  ```

3. Go to /server
4. `npm install`
5. `npm run server`
6. Go to /app
7. `npm install`
8. `npm start`

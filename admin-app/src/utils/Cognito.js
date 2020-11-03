import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import { COGNITO_CODES } from '../common/constants'

const Cognito = () => {
  const Pool = new CognitoUserPool({
    UserPoolId: 'us-east-2_vUtKc2Ydz',
    ClientId: '10hno18t9psaht9i5trb8eoquf'
  })

  let user = null

  const login = (userName, password) => {
    return new Promise((resolve, reject) => {
      user = new CognitoUser({ Username: userName, Pool })
      const authDetails = new AuthenticationDetails({ Username: userName, Password: password })
      const authCallbacks = {
        onSuccess: data => {
          resolve(data)
        },
        onFailure: err => {
          reject(err)
        },
        newPasswordRequired: data => {
          resolve({
            ...data,
            code: COGNITO_CODES.NEW_PASSWORD_REQUIRED
          })
        }
      }

      user.authenticateUser(authDetails, authCallbacks)
    })
  }

  const loginAndChangePassword = (userName, password, newPassword) => {
    return new Promise((resolve, reject) => {
      user = new CognitoUser({ Username: userName, Pool })
      const authDetails = new AuthenticationDetails({ Username: userName, Password: password })

      const authCallbacks = {
        onSuccess: data => {
          resolve(data)
        },
        onFailure: err => {
          reject(err)
        },
        newPasswordRequired: userAttr => {
          const challengeCallbacks = {
            onSuccess: data => resolve(data),
            onFailure: err => reject(err)
          }
          user.completeNewPasswordChallenge(newPassword, null, challengeCallbacks)
        }
      }
      user.authenticateUser(authDetails, authCallbacks)
    })
  }

  const logout = () => {
    if (user) {
      user.storage.clear()
      user.signOut()
    }
  }

  const getSession = async () => {
    await new Promise((resolve, reject) => {
      const user = Pool.getCurrentUser()
      if (user) {
        user.getSession(async (err, session) => {
          if (err) {
            reject(err)
          } else {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err)
                } else {
                  const results = {}

                  for (const attribute of attributes) {
                    const { Name, Value } = attribute
                    results[Name] = Value
                  }

                  resolve(results)
                }
              })
            })
            resolve({
              user,
              ...session,
              ...attributes
            })
          }
        })
      } else {
        // TO DO - Do something with error
        const err = 'something happened'
        reject(err)
      }
    })
  }

  return {
    login,
    logout,
    getSession,
    loginAndChangePassword
  }
}

export default Cognito

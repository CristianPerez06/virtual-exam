import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

const Cognito = () => {
  const Pool = new CognitoUserPool({
    UserPoolId: 'us-east-2_vUtKc2Ydz',
    ClientId: '10hno18t9psaht9i5trb8eoquf'
  })

  let user = null

  const login = (Username, Password) => {
    return new Promise((resolve, reject) => {
      user = new CognitoUser({ Username, Pool })
      const authDetails = new AuthenticationDetails({ Username, Password })
      const authCallbacks = {
        onSuccess: data => {
          console.log('onSuccess:', data)
          resolve(data)
        },
        onFailure: err => {
          console.error('onFailure:', err)
          reject(err)
        },
        newPasswordRequired: data => {
          console.log('newPasswordRequired:', data)
          resolve(data)
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
        reject()
      }
    })
  }

  return {
    login,
    logout,
    getSession
  }
}

export default Cognito

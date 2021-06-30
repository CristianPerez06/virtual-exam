import React, { useState } from 'react'
import { CustomAlert } from '../../components/common'
import { useAuthContext } from '../../hooks'
import { useHistory } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { COGNITO_ERROR_CODES, ACCOUNT_ACTION_TYPES } from '../../common/constants'
import querystring from 'querystring'
import LoginForm from './components/LoginForm'

const Login = (props) => {
  // State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Hooks
  const { dispatch, cognito } = useAuthContext()
  const history = useHistory()

  // Handlers
  const onSuccess = (data) => {
    const { idToken, code, username, email } = data
    setIsLoading(false)

    // Normal workflow
    if (idToken) {
      dispatch({
        type: ACCOUNT_ACTION_TYPES.LOGIN,
        payload: { user: idToken.payload.username, token: idToken.jwtToken }
      })
      // Full page refresh to reload MainRouter and check session
      window.location.replace('/')
    }

    // Password change required
    if (code === COGNITO_ERROR_CODES.NEW_PASSWORD_REQUIRED) {
      const params = querystring.stringify({ id: username, email: email })
      history.push(`/password-change?${params}`)
    }
  }

  const onError = (err) => {
    const { code } = err
    switch (code) {
      case COGNITO_ERROR_CODES.NOT_AUTHORIZED:
        setError({ id: 'cognito_error.not_authorized_exception' })
        break
      default:
        setError({ id: 'common_error.internal_server_error' })
        break
    }
    setIsLoading(false)
  }

  const onSubmit = (values) => {
    const { username, password } = values
    setIsLoading(true)

    cognito.login(username, password)
      .then(data => onSuccess({ ...data, username: username }))
      .catch(err => onError(err))
  }

  return (
    <div className='login d-flex justify-content-center row text-center'>
      <div className='login-form bg-light col-md-12 col-xs-12'>
        <LoginForm isLoading={isLoading} onSubmit={onSubmit} />
      </div>

      <div className='info pt-3 col-md-12 col-xs-12'>
        {!isLoading && error && <CustomAlert messages={error} />}
      </div>
    </div>
  )
}

export default injectIntl(Login)

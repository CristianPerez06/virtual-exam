import React, { useState } from 'react'
import { CustomAlert } from '../../components/common'
import { injectIntl } from 'react-intl'
import { COGNITO_ERROR_CODES, ROLES } from '../../common/constants'
import { useAuthContext } from '../../hooks'
import SignUpForm from './components/SignUpForm'
import SignUpSuccess from './components/SignUpSuccess'

const SignUp = (props) => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpInProgress, setSignUpInProgress] = useState(true)

  // hooks
  const { cognito } = useAuthContext()

  // handlers
  const onSuccess = (data) => {
    setError(null)
    setIsLoading(false)
    setSignUpInProgress(false)
  }

  const onError = (err) => {
    const { code } = err
    switch (code) {
      case COGNITO_ERROR_CODES.USERNAME_EXISTS:
        setError({ id: 'cognito_error.username_exists' })
        break
      case COGNITO_ERROR_CODES.INVALID_PASSWORD_EXCEPTION:
        setError({ id: 'cognito_error.invalid_parameter_exception' })
        break
      case COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION:
        setError({ id: 'cognito_error.invalid_parameter_exception' })
        break
      default:
        setError({ id: 'common_error.internal_server_error' })
        break
    }
    setIsLoading(false)
  }

  const onSubmit = values => {
    const { username, password, email, name, lastname, nickname } = values
    const attributes = [
      { name: 'email', value: email },
      { name: 'name', value: name },
      { name: 'family_name', value: lastname },
      { name: 'nickname', value: nickname }
    ]
    const customAttributes = [
      { name: 'role', value: ROLES.GUEST }
    ]
    setIsLoading(true)

    cognito.signUp(username, password, attributes, customAttributes)
      .then(data => onSuccess(data))
      .catch(err => onError(err))
  }

  return (
    <div className='sign-up d-flex justify-content-center row text-center'>
      <div className='sign-up-form bg-light col-md-12 col-xs-12'>
        {signUpInProgress && <SignUpForm isLoading={isLoading} onSubmit={onSubmit} />}
      </div>

      <div className='info pt-3 col-md-12 col-xs-12'>
        {!isLoading && error && <CustomAlert messages={error} />}
        {!isLoading && !signUpInProgress && <SignUpSuccess />}
      </div>
    </div>
  )
}

export default injectIntl(SignUp)

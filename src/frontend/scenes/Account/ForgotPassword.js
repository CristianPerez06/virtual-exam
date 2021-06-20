import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'
import { COGNITO_ERROR_CODES } from '../../common/constants'
import { CustomAlert } from '../../components/common'
import { useAuthContext } from '../../hooks'
import SendRecoveryCodeForm from './components/SendRecoveryCodeForm'
import ConfirmPasswordForm from './components/ConfirmPasswordForm'

const SignUp = (props) => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('cristian.ap84@gmail.com')
  const [codeSent, setCodeSent] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState(false)

  // hooks
  const { cognito } = useAuthContext()

  // handlers
  const onForgotPasswordSuccess = (data) => {
    setIsLoading(false)
    setCodeSent(true)
  }

  const onConfirmPasswordSuccess = (data) => {
    setIsLoading(false)
    setConfirmedPassword(true)
  }

  const onError = (err) => {
    const { code } = err
    switch (code) {
      case COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION:
        setError({ id: 'cognito_error.invalid_parameter_exception' })
        break
      case COGNITO_ERROR_CODES.CODE_MISMATCH_EXCEPTION:
        setError({ id: 'cognito_error.code_mismatch_exception' })
        break
      case COGNITO_ERROR_CODES.EXPIRED_CODE:
        setError({ id: 'cognito_error.expired_code' })
        break
      default:
        setError({ id: 'common_error.internal_server_error' })
        break
    }
    setIsLoading(false)
  }

  const onSubmitRecoveryCode = values => {
    const { email } = values
    setError(false)
    setEmail(email)
    setIsLoading(true)

    cognito.forgotPassword(email)
      .then(data => onForgotPasswordSuccess(data))
      .catch(err => onError(err))
  }

  const onSubmitConfirmPassword = values => {
    const { recoveryCode, newPassword } = values
    setError(false)
    setIsLoading(true)

    cognito.confirmPassword(email, recoveryCode, newPassword)
      .then(data => onConfirmPasswordSuccess(data))
      .catch(err => onError(err))
  }

  return (
    <div className='forgot-password d-flex justify-content-center row text-center'>
      <div className='forgot-password-form bg-light col-md-12 col-xs-12'>
        {!codeSent
          ? <SendRecoveryCodeForm isLoading={isLoading} onSubmit={onSubmitRecoveryCode} />
          : <ConfirmPasswordForm isLoading={isLoading} email={email} disabled={confirmedPassword} onSubmit={onSubmitConfirmPassword} />}
        <Link className='nav-link' to='/login'>
          <FormattedMessage id='button.go_signin_page' />
        </Link>
      </div>

      <div className='info pt-3 col-md-12 col-xs-12'>
        {!isLoading && error && <CustomAlert messages={error} />}
        {!isLoading && !error && codeSent && !confirmedPassword && <CustomAlert color='success' messages={{ id: 'recovery_code_sent' }} />}
        {!isLoading && confirmedPassword && <CustomAlert color='success' messages={{ id: 'password_updated' }} />}
      </div>
    </div>
  )
}

export default injectIntl(SignUp)

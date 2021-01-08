import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { ERROR_MESSAGES, COGNITO_ERROR_CODES } from '../../common/constants'
import { translateFieldError } from '../../common/translations'
import { required, emailFormat, composeValidators } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { useAuthContext } from '../../hooks'

const messages = defineMessages({
  internalServerError: {
    id: 'common_error.internal_server_error',
    defaultMessage: 'Internal server error'
  },
  invalidParameterException: {
    id: 'cognito_error.invalid_parameter_exception',
    defaultMessage: 'Incorrect value for some of the required fields'
  },
  codeMismatchException: {
    id: 'cognito_error.code_mismatch_exception',
    defaultMessage: 'Invalid verification code provided'
  },
  recoveryCodeSent: {
    id: 'recovery_code_sent',
    defaultMessage: 'Recovery code sent'
  }
})

const SignUp = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
    setCodeSent(false)
    setConfirmedPassword(true)
  }

  const onError = (err) => {
    const { code } = err
    switch (code) {
      case COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION:
        setError({ id: COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION, message: formatMessage(messages.invalidParameterException) })
        break
      case COGNITO_ERROR_CODES.CODE_MISMATCH_EXCEPTION:
        setError({ id: COGNITO_ERROR_CODES.CODE_MISMATCH_EXCEPTION, message: formatMessage(messages.codeMismatchException) })
        break
      default:
        setError({ id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage(messages.internalServerError)})
        break
    }
    setIsLoading(false)
  }

  const onSubmit = values => {
    const { email, recoveryCode, newPassword } = values
    setError(false)
    setCodeSent(false)
    setIsLoading(true)

    if (codeSent) {
      cognito.confirmPassword(email, recoveryCode, newPassword)
        .then(data => onConfirmPasswordSuccess(data))
        .catch(err => onError(err))
    } else {
      cognito.forgotPassword(email)
        .then(data => onForgotPasswordSuccess(data))
        .catch(err => onError(err))
    }
  }

  return (
    <div className='d-flex h-100 align-items-center justify-content-center' style={{ background: 'rgba(0, 0, 0, 0.76)' }}>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className='text-center bg-light p-5'
            style={{ minWidth: 400 + 'px' }}
          >
            <div className='pb-3'>
              <p className='h4 mb-4'>
                <FormattedMessage id='common_title.forgot_password' defaultMessage={'Reset your password'} />
              </p>
              <Field name='email' validate={composeValidators(required, emailFormat)}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder='Email'
                      disabled={isLoading || codeSent || confirmedPassword}
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
              {!confirmedPassword &&
                <div>
                  {/* Forgot password */}
                  {!codeSent &&
                    <div className='forgot-password-workflow'>
                      <Button color='primary' disabled={isLoading}>
                        <FormattedMessage id='button.send_recovery_code' defaultMessage={'Send recovery code'} />
                        {isLoading && <LoadingInline className='ml-3' />}
                      </Button>
                    </div>}
                  {/* Update password */}
                  {codeSent &&
                    <div className='update-password-workflow'>
                      <Field name='recoveryCode' validate={required}>
                        {({ input, meta }) => (
                          <div className='mb-4'>
                            <input
                              {...input}
                              className='form-control'
                              placeholder={intl.formatMessage({id: 'recovery_code'})}
                              disabled={isLoading}
                            />
                            {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                          </div>
                        )}
                      </Field>
                      <Field name='newPassword' validate={required}>
                        {({ input, meta }) => (
                          <div className='mb-4'>
                            <input
                              {...input}
                              className='form-control'
                              type='password'
                              placeholder={intl.formatMessage({id: 'new_password'})}
                              disabled={isLoading}
                            />
                            {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                          </div>
                        )}
                      </Field>
                      <Button color='primary' disabled={isLoading || confirmedPassword}>
                        <FormattedMessage id='button.update_password' defaultMessage={'Update password'} />
                        {isLoading && <LoadingInline className='ml-3' />}
                      </Button>
                    </div>}
                </div>}
            </div>
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error &&
                <CustomAlert messages={error} className='ml-3' />}
              {!isLoading && codeSent &&
                <CustomAlert
                  messages={{id: 'recovery_code_sent', message: formatMessage(messages.recoveryCodeSent)}}
                  color='success'
                  className='ml-3'
                />}
              {!isLoading && confirmedPassword &&
                <div>
                  <CustomAlert message='Password successfully updated' color='success' className='ml-3' />
                  <Link className='nav-link' to='/login'>
                    <FormattedMessage id='button.go_signin_page' defaultMessage={'Go to sign in page'} />
                  </Link>
                </div>}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(SignUp)

import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useAuthContext } from '../../hooks'
import { useHistory, Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ERROR_MESSAGES, COGNITO_ERROR_CODES, ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { translateFieldError } from '../../common/translations'
import { required, composeValidators, mustBeNumber } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError, LocaleSelector } from '../../components/common'
import querystring from 'querystring'

const Login = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch, cognito } = useAuthContext()
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken, code, username, email } = data
    setIsLoading(false)

    // Normal workflow
    if (accessToken) {
      dispatch({
        type: ACCOUNT_ACTION_TYPES.LOGIN,
        payload: { user: accessToken.payload.username, token: accessToken.jwtToken }
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
        setError({ id: COGNITO_ERROR_CODES.NOT_AUTHORIZED, message: formatMessage({ id: 'cognito_error.not_authorized_exception' }) })
        break
      default:
        setError({ id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage({ id: 'common_error.internal_server_error' }) })
        break
    }
    setIsLoading(false)
  }

  const onSubmit = values => {
    const { username, password } = values
    setIsLoading(true)

    cognito.login(username, password)
      .then(data => onSuccess({ ...data, username: username }))
      .catch(err => onError(err))
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
                <FormattedMessage id='common_title.sign_in' />
              </p>
              <Field name='username' validate={composeValidators(required, mustBeNumber)}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder='ID'
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
              <Field name='password' validate={required}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      type='password'
                      className='form-control'
                      placeholder={formatMessage({ id: 'password' })}
                    />
                    {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                  </div>
                )}
              </Field>
              <Button color='primary' disabled={isLoading}>
                <FormattedMessage id='button.signin' />
                {isLoading && <LoadingInline className='ml-3' />}
              </Button>
            </div>
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error && <CustomAlert messages={error} />}
            </div>
            <div className='d-flex justify-content-around pt-3'>
              <Link className='nav-link' to='/sign-up'>
                <FormattedMessage id='button.signup' />
              </Link>
              <Link className='nav-link' to='/forgot-password'>
                <FormattedMessage id='button.forgot_password' />
              </Link>
            </div>
            <div className='mt-2'>
              <LocaleSelector />
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(Login)

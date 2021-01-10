import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { required, shouldMatch, composeValidators, emailFormat, mustBeNumber, rangeValues } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ERROR_MESSAGES, COGNITO_ERROR_CODES, ID_LENGTH } from '../../common/constants'
import { translateFieldError } from '../../common/translations'
import { useAuthContext } from '../../hooks'

const SignUp = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

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
        setError({ id: COGNITO_ERROR_CODES.USERNAME_EXISTS, message: formatMessage({ id: 'cognito_error.username_exists' }) })
        break
      case COGNITO_ERROR_CODES.INVALID_PASSWORD_EXCEPTION:
        setError({ id: COGNITO_ERROR_CODES.INVALID_PASSWORD_EXCEPTION, message: formatMessage({ id: 'cognito_error.invalid_parameter_exception' }) })
        break
      case COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION:
        setError({ id: COGNITO_ERROR_CODES.INVALID_PARAMETER_EXCEPTION, message: formatMessage({ id: 'cognito_error.invalid_parameter_exception' }) })
        break
      default:
        setError({ id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage({ id: 'common.internal_server_error' }) })
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
    setIsLoading(true)

    cognito.signUp(username, password, attributes)
      .then(data => onSuccess(data))
      .catch(err => onError(err))
  }

  return (
    <div className='d-flex h-100 align-items-center justify-content-center' style={{ background: 'rgba(0, 0, 0, 0.76)' }}>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, values }) => (
          <form
            onSubmit={handleSubmit}
            className='text-center bg-light p-5'
            style={{ minWidth: 400 + 'px' }}
          >
            <p className='h4 mb-4'>
              <FormattedMessage id='common_title.register_user' />
            </p>

            {signUpInProgress &&
              <div>
                <Field name='username' validate={composeValidators(required, mustBeNumber, rangeValues(ID_LENGTH.MIN, ID_LENGTH.MAX))}>
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
                <Field name='name' validate={required}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder={formatMessage({ id: 'first_name' })}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )}
                </Field>
                <Field name='lastname' validate={required}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder={formatMessage({ id: 'last_name' })}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )}
                </Field>
                <Field name='email' validate={composeValidators(required, emailFormat)}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder='Email'
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )}
                </Field>
                {/* TO DO - Add regex validation for nickname */}
                <Field name='nickname' validate={required}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder={formatMessage({ id: 'nick_name' })}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                    </div>
                  )}
                </Field>
                {/* TO DO - Add regex validation for password (use cognito format) */}
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
                <Field name='confirmPassword' validate={composeValidators(required, shouldMatch(values.password))}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        type='password'
                        className='form-control'
                        placeholder={formatMessage({ id: 'confirm_password' })}
                      />
                      {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error, formatMessage({ id: 'password' }), formatMessage({ id: 'confirm_password' }))} />}
                    </div>
                  )}
                </Field>
                <Button color='primary' disabled={isLoading}>
                  <FormattedMessage id='button.register' />
                  {isLoading && <LoadingInline className='ml-3' />}
                </Button>
              </div>}
            <div className='d-flex justify-content-around pt-3'>
              {/* TO DO - Error no se muestra */}
              {!isLoading && error && <CustomAlert messages={error} className='ml-3' />}
              {!isLoading && !signUpInProgress &&
                <div>
                  <CustomAlert
                    messages={{ id: 'registration_completed', message: formatMessage({ id: 'registration_completed' }) }}
                    color='success'
                    className='ml-3'
                  />
                  <Link className='nav-link' to='/login'>
                    <FormattedMessage id='button.go_signin_page' />
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

import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { Cognito } from '../../utils'
import { required, emailFormat, composeValidators } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'

const { forgotPassword, confirmPassword } = Cognito()

const SignUp = () => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState(false)

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
    setIsLoading(false)
    setError(err.message)
  }

  const onSubmit = values => {
    const { email, recoveryCode, newPassword } = values
    setIsLoading(true)

    if (codeSent) {
      confirmPassword(email, recoveryCode, newPassword)
        .then(data => onConfirmPasswordSuccess(data))
        .catch(err => onError(err))
    } else {
      forgotPassword(email)
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
              <p className='h4 mb-4'>Forgot password</p>
              <div>
                <Field name='email' validate={composeValidators(required, emailFormat)}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder='Email'
                        disabled={codeSent || confirmedPassword}
                      />
                      {meta.error && meta.touched && <FieldError error={meta.error} />}
                    </div>
                  )}
                </Field>
                {codeSent &&
                  <div>
                    <Field name='recoveryCode' validate={required}>
                      {({ input, meta }) => (
                        <div className='mb-4'>
                          <input
                            {...input}
                            className='form-control'
                            placeholder='Recovery code'
                            disabled={confirmedPassword}
                          />
                          {meta.error && meta.touched && <FieldError error={meta.error} />}
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
                            placeholder='New password'
                            disabled={confirmedPassword}
                          />
                          {meta.error && meta.touched && <FieldError error={meta.error} />}
                        </div>
                      )}
                    </Field>
                  </div>}
                <Button color='primary' disabled={isLoading || confirmedPassword}>
                  {!codeSent ? 'Send recovery code' : 'Update password'}
                  {isLoading && <LoadingInline className='ml-3' />}
                </Button>
              </div>

            </div>
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error &&
                <CustomAlert message={error} className='ml-3' />}
              {!isLoading && codeSent && !confirmedPassword &&
                <CustomAlert message='Recovery code sent' color='success' className='ml-3' />}
              {confirmedPassword &&
                <div>
                  <CustomAlert message='Password successfully updated' color='success' className='ml-3' />
                  <Link className='nav-link' to='/login'>Go back to Sign in page</Link>
                </div>}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default SignUp

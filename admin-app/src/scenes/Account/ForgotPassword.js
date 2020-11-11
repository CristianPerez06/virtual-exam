import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { required, emailFormat, composeValidators } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { useAuthContext } from '../../hooks'

const SignUp = () => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState(false)

  // hooks
  const { cognitoHelper } = useAuthContext()

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
      cognitoHelper.confirmPassword(email, recoveryCode, newPassword)
        .then(data => onConfirmPasswordSuccess(data))
        .catch(err => onError(err))
    } else {
      cognitoHelper.forgotPassword(email)
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
              <Field name='email' validate={composeValidators(required, emailFormat)}>
                {({ input, meta }) => (
                  <div className='mb-4'>
                    <input
                      {...input}
                      className='form-control'
                      placeholder='Email'
                      disabled={isLoading || codeSent || confirmedPassword}
                    />
                    {meta.error && meta.touched && <FieldError error={meta.error} />}
                  </div>
                )}
              </Field>
              {!confirmedPassword &&
                <div>
                  {/* Forgot password */}
                  {!codeSent &&
                    <div className='forgot-password-workflow'>
                      <Button color='primary' disabled={isLoading}>
                        Send recovery code
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
                              placeholder='Recovery code'
                              disabled={isLoading}
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
                              disabled={isLoading}
                            />
                            {meta.error && meta.touched && <FieldError error={meta.error} />}
                          </div>
                        )}
                      </Field>
                      <Button color='primary' disabled={isLoading || confirmedPassword}>
                        Update password
                        {isLoading && <LoadingInline className='ml-3' />}
                      </Button>
                    </div>}
                </div>}
            </div>
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error &&
                <CustomAlert message={error} className='ml-3' />}
              {!isLoading && codeSent &&
                <CustomAlert message='Recovery code sent' color='success' className='ml-3' />}
              {!isLoading && confirmedPassword &&
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

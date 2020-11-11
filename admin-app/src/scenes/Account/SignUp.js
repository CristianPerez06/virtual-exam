import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { required, shouldMatch, composeValidators } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { useAuthContext } from '../../hooks'

const SignUp = () => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpInProgress, setSignUpInProgress] = useState(true)
  const [userName, setUserName] = useState('')

  // hooks
  const { cognitoHelper } = useAuthContext()

  // handlers
  const onSuccess = (data) => {
    const { user } = data
    setIsLoading(false)
    setSignUpInProgress(false)
    setUserName(user.username)
  }

  const onError = (err) => {
    setIsLoading(false)
    setError(err.code)
  }

  const onSubmit = values => {
    const { username, password, email } = values

    const attributes = [
      { name: 'email', value: email }
    ]
    setIsLoading(true)

    cognitoHelper.signUp(username, password, attributes)
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
            <p className='h4 mb-4'>Sign up</p>
            {signUpInProgress &&
              <div>
                <Field name='username' validate={required}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder='Username'
                      />
                      {meta.error && meta.touched && <FieldError error={meta.error} />}
                    </div>
                  )}
                </Field>
                <Field name='email' validate={required}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        className='form-control'
                        placeholder='Email'
                      />
                      {meta.error && meta.touched && <FieldError error={meta.error} />}
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
                        placeholder='Password'
                      />
                      {meta.error && meta.touched && <FieldError error={meta.error} />}
                    </div>
                  )}
                </Field>
                <Field name='confirmPassword' validate={composeValidators(required, shouldMatch('Password', 'Confirm password', values.password))}>
                  {({ input, meta }) => (
                    <div className='mb-4'>
                      <input
                        {...input}
                        type='password'
                        className='form-control'
                        placeholder='Confirm password'
                      />
                      {meta.error && meta.touched && <FieldError error={meta.error} />}
                    </div>
                  )}
                </Field>
                <Button color='primary' disabled={isLoading}>
                  Register
                  {isLoading && <LoadingInline className='ml-3' />}
                </Button>
              </div>}
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error && <CustomAlert message={error} className='ml-3' />}
              {!isLoading && !signUpInProgress &&
                <div>
                  <CustomAlert message={`Registration for user ${userName} completed!`} color='success' className='ml-3' />
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

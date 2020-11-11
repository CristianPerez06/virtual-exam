import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useAuthContext } from '../../hooks'
import { useHistory, Link } from 'react-router-dom'
import { Button } from 'reactstrap'
import { ACCOUNT_ACTION_TYPES, COGNITO_CODES } from '../../common/constants'
import { required } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import querystring from 'querystring'

const Login = () => {
  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch, cognitoHelper } = useAuthContext()
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken, code, email } = data
    setIsLoading(false)

    // Normal workflow
    if (accessToken) {
      dispatch({
        type: ACCOUNT_ACTION_TYPES.LOGIN,
        payload: { user: accessToken.payload.username, token: accessToken.jwtToken }
      })
      history.push('/')
    }

    // Password change required
    if (code === COGNITO_CODES.NEW_PASSWORD_REQUIRED) {
      const params = querystring.stringify({ mail: email })
      history.push(`/password-change?${params}`)
    }
  }

  const onError = (err) => {
    setIsLoading(false)
    setError(err.message)
  }

  const onSubmit = values => {
    const { username, password } = values
    setIsLoading(true)

    cognitoHelper.login(username, password)
      .then(data => onSuccess(data))
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
              <p className='h4 mb-4'>Sign in</p>
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
              <Button color='primary' disabled={isLoading}>
                Log in
                {isLoading && <LoadingInline className='ml-3' />}
              </Button>
            </div>
            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error && <CustomAlert message={error} className='ml-3' />}
            </div>
            <div className='d-flex justify-content-around pt-3'>
              <Link className='nav-link' to='/sign-up'>Sign up</Link>
              <Link className='nav-link' to='/forgot-password'>Forgot password</Link>
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default Login

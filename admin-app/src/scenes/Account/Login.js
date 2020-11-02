import React, { useState, useContext } from 'react'
import { Form, Field } from 'react-final-form'
import { AuthContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { Button } from 'reactstrap'
import { Cognito } from '../../utils'
import { ACCOUNT_ACTION_TYPE } from '../../common/constants'
import { required, emailFormat, composeValidators } from '../../common/validators'
import { LoadingInline, ErrorViewer, FieldError } from '../../components/common'

const { login } = Cognito()

const Login = () => {
  // state
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch } = useContext(AuthContext)
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken } = data
    dispatch({
      type: ACCOUNT_ACTION_TYPE.LOGIN,
      payload: { user: accessToken.payload.username, token: accessToken.jwtToken }
    })
    setIsLoading(false)
    history.push('/')
  }

  const onError = (err) => {
    setIsLoading(false)
    setError(err.message)
  }

  const onSubmit = values => {
    const { email, password } = values
    setIsLoading(true)

    login(email, password)
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
            <p className='h4 mb-4'>Sign in</p>
            <Field name='email' validate={composeValidators(required, emailFormat)}>
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
            <Button color='primary' disabled={isLoading}>
              Sign in
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>

            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error && <ErrorViewer error={error} className='ml-3' />}
              {/* <a href='#'>Register</a> */}
              {/* <a href='#'>Forgot password?</a> */}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default Login

import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { useHistory } from 'react-router-dom'
import { Input, Button } from 'reactstrap'
import { ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { required, shouldNotMatch, composeValidators } from '../../common/validators'
import { LoadingInline, CustomAlert, FieldError } from '../../components/common'
import { useQueryParams, useAuthContext } from '../../hooks'

const PasswordChange = () => {
  // props
  const queryParams = useQueryParams()
  const username = queryParams.get('username')
  const email = queryParams.get('email')

  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch, cognito } = useAuthContext()
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken } = data

    setIsLoading(false) // TO DO - Review - States are being reset before accessing onSuccess/onError.
    dispatch({
      type: ACCOUNT_ACTION_TYPES.LOGIN,
      payload: { user: accessToken.payload.username, token: accessToken.jwtToken }
    })
    history.push('/')
  }

  const onError = (err) => {
    setIsLoading(false)
    setError(err.message)
  }

  const onSubmit = values => {
    const { password, newPassword } = values

    setIsLoading(true)
    cognito.loginAndChangePassword(username, password, newPassword)
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
            <p className='h4 mb-4'>Change password</p>
            <Input
              id='username'
              className='form-control mb-4'
              placeholder='Username'
              value={username}
              readOnly
            />
            <Input
              id='email'
              className='form-control mb-4'
              placeholder='Email'
              value={email}
              readOnly
            />
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
            <Field name='newPassword' validate={composeValidators(required, shouldNotMatch('Password', 'New password', values.password))}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    type='password'
                    className='form-control'
                    placeholder='New password'
                  />
                  {meta.error && meta.touched && <FieldError error={meta.error} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading}>
              Change password
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>

            <div className='d-flex justify-content-around pt-3'>
              {!isLoading && error && <CustomAlert message={error} className='ml-3' />}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default PasswordChange
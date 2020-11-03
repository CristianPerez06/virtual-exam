import React, { useState, useContext } from 'react'
import { Form, Field } from 'react-final-form'
import { AuthContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { Input, Button } from 'reactstrap'
import { Cognito } from '../../utils'
import { ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { required, shouldNotMatch, composeValidators } from '../../common/validators'
import { LoadingInline, ErrorViewer, FieldError } from '../../components/common'
import { useQueryParams } from '../../hooks'

const { loginAndChangePassword } = Cognito()

const PasswordChange = () => {
  // props
  const queryParams = useQueryParams()
  const userEmail = queryParams.get('mail')

  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch } = useContext(AuthContext)
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken } = data

    setIsLoading(false)
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
    loginAndChangePassword(userEmail, password, newPassword)
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
              id='email'
              className='form-control mb-4'
              placeholder='Email'
              value={userEmail}
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
              {!isLoading && error && <ErrorViewer error={error} className='ml-3' />}
            </div>
          </form>
        )}
      />
    </div>
  )
}

export default PasswordChange

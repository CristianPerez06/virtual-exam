import React, { useState, useContext } from 'react'
import { AuthContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { Form, Input, Button } from 'reactstrap'
import { Cognito } from '../../utils'
import { ACCOUNT_ACTION_TYPE } from '../../common/constants'

const { login } = Cognito()

const Login = () => {
  // state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
    history.push('/')
  }

  const onError = (err) => {
    // TO DO - Handle login error
    console.log(err)
  }

  const onSubmit = event => {
    event.preventDefault()

    login(email, password)
      .then(data => onSuccess(data))
      .catch(err => onError(err))
  }
  return (
    <div className='row h-100 align-items-center justify-content-center' style={{ background: 'rgba(0, 0, 0, 0.76)' }}>
      <Form className='text-center bg-light p-5' onSubmit={onSubmit} style={{ minWidth: 400 + 'px' }}>
        <p className='h4 mb-4'>Sign in</p>
        <Input
          id='email'
          className='form-control mb-4'
          type='email'
          placeholder='Email'
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
        <Input
          id='password'
          className='form-control mb-4'
          type='password'
          placeholder='Password'
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
        <Button color='primary'>Sign in</Button>
        <div className='d-flex justify-content-around pt-3'>
          {/* <a href='#'>Register</a> */}
          {/* <a href='#'>Forgot password?</a> */}
        </div>
      </Form>
    </div>
  )
}

export default Login

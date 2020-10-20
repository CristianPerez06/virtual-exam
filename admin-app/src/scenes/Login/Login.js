import React from 'react'
import { Form, Input, Button } from 'reactstrap'

const Login = () => {
  return <div className='row h-100 align-items-center justify-content-center'>
    <Form className='text-center bg-light p-5'>
      <p className="h4 mb-4">Sign in</p>
      <Input className='form-control mb-4' type='email' id='email' placeholder='Email' />
      <Input className='form-control mb-4' type='password' id='password' placeholder='Password' />
      <Button color="primary">Sign in</Button>
      <div className='d-flex justify-content-around pt-3'>
        <a href='#'>Register</a>
        <a href='#'>Forgot password?</a>
      </div>
    </Form>
  </div>
}

export default Login

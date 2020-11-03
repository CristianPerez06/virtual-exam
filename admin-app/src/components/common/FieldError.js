import React from 'react'
import { Alert } from 'reactstrap'

const FieldError = (props) => {
  const { error } = props

  return (
    <Alert
      className='alert-warning d-flex align-items-start justify-content-start flex-column mt-1'
      style={{ paddingTop: 0.25 + 'rem', paddingBottom: 0.25 + 'rem' }}
    >
      {error}
    </Alert>
  )
}

export default FieldError

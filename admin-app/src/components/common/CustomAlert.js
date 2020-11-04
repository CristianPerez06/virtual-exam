import React from 'react'
import { Alert } from 'reactstrap'

const CustomAlert = (props) => {
  const { message, color = 'danger' } = props
  // TO DO - use translations
  // const errors = Array.isArray(error) && error.length > 0 ? error : [{}]

  return (
    <Alert className={`alert-${color} d-flex align-items-start justify-content-start flex-column`}>
      <ul className='text-left'>
        {/* {
          errors.map(({ id, message }) => id
            ? <li key={id}>{message}</li>
            : <li key='internal_server_error'>Oops. Something went wrong.</li>
          )
        } */}
        <li>{message}</li>
      </ul>
    </Alert>
  )
}

export default CustomAlert

import React from 'react'
import { Alert } from 'reactstrap'

const CustomAlert = (props) => {
  const { messages, color = 'danger' } = props
  // TO DO - use translations
  const messageList = Array.isArray(messages) && messages.length > 0 ? messages : [{}]
  return (
    <Alert className={`alert-${color} d-flex align-items-start justify-content-start flex-column`}>
      <ul className='text-left'>
        {
          messageList.map((value, index) => <li key={index}>{value.message}</li>)
        }
      </ul>
    </Alert>
  )
}

export default CustomAlert

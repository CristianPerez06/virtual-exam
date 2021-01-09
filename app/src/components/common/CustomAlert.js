import React from 'react'
import { injectIntl } from 'react-intl'
import { Alert } from 'reactstrap'

const CustomAlert = (props) => {
  const { messages, color = 'danger' } = props
  const messageList = Array.isArray(messages) && messages.length > 0 ? messages : [{ ...messages }]
  return (
    <Alert className={`alert-${color} d-flex align-items-start justify-content-start flex-column`}>
      <ul className='text-left'>
        { messageList.map((value, index) => <li key={index}>{value.message}</li>) }
      </ul>
    </Alert>
  )
}

export default injectIntl(CustomAlert)

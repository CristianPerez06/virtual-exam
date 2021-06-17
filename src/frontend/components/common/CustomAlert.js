import React from 'react'
import { injectIntl } from 'react-intl'
import { Alert } from 'reactstrap'

const CustomAlert = (props) => {
  const { messages, color = 'danger', intl } = props
  const { formatMessage } = intl

  const messageList = Array.isArray(messages) && messages.length > 0 ? messages : [{ ...messages }]

  return (
    <div className='d-flex justify-content-center mt-4 w-100'>
      <Alert color={color} style={{ maxWidth: 500 + 'px' }}>
        <ul className='text-left mb-0'>
          {messageList.map((value, index) => {
            return (
              <li key={index}>
                {formatMessage({ id: value.id })}
              </li>
            )
          })}
        </ul>
      </Alert>
    </div>
  )
}

export default injectIntl(CustomAlert)

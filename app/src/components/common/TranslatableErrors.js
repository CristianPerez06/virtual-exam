import React from 'react'
import { injectIntl } from 'react-intl'
import { Alert } from 'reactstrap'

const TranslatableErrors = (props) => {
  // Props and params
  const { errors, intl } = props
  const { formatMessage } = intl
  const errorsList = Array.isArray(errors) && errors.length > 0 ? errors : [{ ...errors }]

  return (
    <div className='d-flex justify-content-center mt-2 w-100'>
      <Alert color='danger' style={{ maxWidth: 500 + 'px' }}>
        <ul className='text-left mb-0'>
          {errorsList.map((error) => {
            return <li key={error.id}>{formatMessage({ id: error.translatableMessageId })}</li>
          })}
        </ul>
      </Alert>
    </div>
  )
}

export default injectIntl(TranslatableErrors)

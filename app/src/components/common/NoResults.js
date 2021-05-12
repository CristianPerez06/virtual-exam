import React from 'react'
import { FormattedMessage } from 'react-intl'

const NoResults = () => {
  return (
    <div id='no-results' className='text-center mt-2 mb-3'>
      <FormattedMessage id='common_message.no_results' />
    </div>
  )
}

export default NoResults

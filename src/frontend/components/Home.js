import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

const Home = (props) => {
  return (
    <div id='home' className='text-center'>
      <FormattedMessage id='welcome_virtual_exam' />
    </div>
  )
}

export default injectIntl(Home)

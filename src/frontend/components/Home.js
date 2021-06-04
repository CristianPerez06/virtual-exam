import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

const Home = (props) => {
  return (
    <div id='home'>
      <FormattedMessage id='welcome_virtual_exam' />
    </div>
  )
}

export default injectIntl(Home)

import React from 'react'
import { Link } from 'react-router-dom'
import { CustomAlert } from '../../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'

const SignUpSuccess = (props) => {
  return (
    <div className='sign-up-success bg-light p-4 col-md-12 col-xs-12'>
      <p className='h4 mb-4'>
        <FormattedMessage id='common_title.register_user' />
      </p>
      <CustomAlert
        messages={{ id: 'registration_completed' }}
        color='success'
        className='ml-3'
      />
      <Link className='nav-link' to='/login'>
        <FormattedMessage id='button.go_signin_page' />
      </Link>
    </div>
  )
}

export default injectIntl(SignUpSuccess)

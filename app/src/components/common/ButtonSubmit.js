import React from 'react'
import { Button } from 'reactstrap'
import { LoadingInline } from '../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'

const CustomAlert = (props) => {
  const { isDisabled, isLoading } = props

  return (
    <Button color='primary' type='submit' className='m-2' disabled={isDisabled}>
      <FormattedMessage id='button.save' />
      {isLoading && <LoadingInline className='ml-3' />}
    </Button>
  )
}

export default injectIntl(CustomAlert)

import React from 'react'
import { Button } from 'reactstrap'
import { LoadingInline } from '.'
import { injectIntl, FormattedMessage } from 'react-intl'

const ButtonWrapper = (props) => {
  const { color, translatableTextId, type, isDisabled, isLoading, handleOnClick } = props

  return (
    <Button
      color={color}
      type={type}
      className='m-2'
      disabled={isDisabled}
      onClick={handleOnClick}
    >
      <FormattedMessage id={translatableTextId} />
      {isLoading && <LoadingInline className='ml-3' />}
    </Button>
  )
}

export default injectIntl(ButtonWrapper)

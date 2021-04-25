import React from 'react'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

const ButtonGoTo = (props) => {
  const {
    path,
    color,
    translatableTextId,
    isDisabled
  } = props

  return (
    <Link to={path}>
      <Button color={color} className='m-2' disabled={isDisabled}>
        <FormattedMessage id={translatableTextId} />
      </Button>
    </Link>
  )
}

export default injectIntl(ButtonGoTo)

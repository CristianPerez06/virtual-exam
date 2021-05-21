import React from 'react'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

const ButtonGoToList = (props) => {
  const { entity, isDisabled } = props

  return (
    <Link to={`/${entity}/list`}>
      <Button color='secondary' className='m-2' disabled={isDisabled}>
        <FormattedMessage id='button.go_to_list' />
      </Button>
    </Link>
  )
}

export default injectIntl(ButtonGoToList)

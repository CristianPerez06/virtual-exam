import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

const TranslatableTitle = (props) => {
  const {
    isCreating,
    entityName,
    intl
  } = props

  const { formatMessage } = intl

  return (
    <p className='text-center h4 mb-4'>
      {isCreating
        ? <FormattedMessage id='common_action.create' />
        : `${formatMessage({ id: 'common_action.edit' })}`} {formatMessage({ id: `common_entity.${entityName}` }).toLowerCase()}
    </p>
  )
}

export default injectIntl(TranslatableTitle)

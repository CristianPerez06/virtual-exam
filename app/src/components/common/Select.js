import React from 'react'
import { injectIntl } from 'react-intl'

const Select = (props) => {
  // Props and params
  const { options, selectClass, selectedValue, onChange, intl } = props
  const { formatMessage } = intl

  const handleChange = (value) => {
    const newValue = value.target.value === 'DEFAULT_VALUE'
      ? undefined
      : value.target.value
    onChange(newValue)
  }

  return (
    <select
      className={selectClass}
      onChange={(x) => handleChange(x)}
      value={selectedValue}
    >
      <option value='DEFAULT_VALUE'>{formatMessage({ id: 'common_message.select_value' })}</option>
      {options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
    </select>
  )
}

export default injectIntl(Select)

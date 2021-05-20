import React from 'react'
import { FieldError } from '../../common'
import { Field } from 'react-final-form'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import Select from 'react-select'

const SelectWrapper = (props) => {
  const {
    fieldName,
    isDisabled,
    options,
    validations,
    selectedValue,
    handleOnChange,
    intl
  } = props

  const mappedOptions = options.map((option) => {
    return {
      value: option.id,
      label: option.name
    }
  })
  const mappedSelectedValue = mappedOptions.find(option => option.value === selectedValue)

  return (
    <Field name={fieldName} component='select' validate={validations}>
      {({ input, meta, options }) => (
        <div>
          <Select
            value={mappedSelectedValue || ''}
            options={mappedOptions}
            isDisabled={isDisabled}
            onChange={(x) => {
              handleOnChange(x)
              input.onChange(x.value)
            }}
          />
          {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
        </div>
      )}
    </Field>
  )
}

export default injectIntl(SelectWrapper)

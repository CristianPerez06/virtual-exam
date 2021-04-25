import React from 'react'
import { FieldError, Select } from '../../common'
import { Field } from 'react-final-form'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../../common/translations'

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

  return (
    <Field name={fieldName} component='select' options={options} validate={validations}>
      {({ input, meta, options }) => (
        <div>
          <Select
            options={options}
            selectClass='form-control'
            selectedValue={selectedValue}
            onChange={(value) => {
              handleOnChange(value)
              input.onChange(value)
            }}
            disabled={isDisabled}
          />
          {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
        </div>
      )}
    </Field>
  )
}

export default injectIntl(SelectWrapper)

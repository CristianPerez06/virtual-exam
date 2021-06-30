import React from 'react'
import { Field } from 'react-final-form'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import { FieldError } from '../../common'

const FieldWrapper = (props) => {
  const {
    fieldName,
    validations,
    placeHolder,
    intl
  } = props

  const fieldProps = {
    name: fieldName,
    ...(validations && { validate: validations })
  }

  return (
    <Field {...fieldProps}>
      {({ input, meta }) => (
        <div className='mb-2'>
          <input
            {...input}
            className='form-control'
            placeholder={placeHolder}
          />
          {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
        </div>
      )}
    </Field>
  )
}

export default injectIntl(FieldWrapper)

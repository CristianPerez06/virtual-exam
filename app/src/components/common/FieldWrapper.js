import React from 'react'
import { Field } from 'react-final-form'
import { injectIntl } from 'react-intl'
import { translateFieldError } from '../../common/translations'
import { FieldError } from '../common'

const FieldWrapper = (props) => {
  const {
    fieldName,
    validations,
    placeHolder,
    intl
  } = props

  return (
    <Field name={fieldName} validate={validations}>
      {({ input, meta }) => (
        <div className='mb-4'>
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
import { ERROR_FIELDS } from '../common/constants'

export const translateFieldError = (intl, error, fieldA, fieldB) => {
  const { formatMessage } = intl
  let t = ''
  switch (error) {
    case ERROR_FIELDS.REQUIRED:
      return formatMessage({ id: 'common_field_error.required' })
    case ERROR_FIELDS.MUST_BE_A_NUMBER:
      return formatMessage({ id: 'common_field_error.must_be_a_number' })
    case ERROR_FIELDS.INCORRECT_EMAIL_FORMAT:
      return formatMessage({ id: 'common_field_error.incorrect_email_format' })
    case ERROR_FIELDS.FIELDS_SHOULD_MATCH:
      t = formatMessage({ id: 'common_field_error.fields_should_match' })
      t = t.replace('{fieldA}', fieldA)
      t = t.replace('{fieldB}', fieldB)
      return t
    case ERROR_FIELDS.FIELDS_SHOULDNT_MATCH:
      t = formatMessage({ id: 'common_field_error.fields_shouldnt_match' })
      t = t.replace('{fieldA}', fieldA)
      t = t.replace('{fieldB}', fieldB)
      return t
    default:
      return error
  }
}

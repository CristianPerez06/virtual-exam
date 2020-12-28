export const required = (value) => (value ? undefined : 'REQUIRED')

export const mustBeNumber = value => (isNaN(value) ? 'MUST_BE_A_NUMBER' : undefined)

export const shouldMatch = (field, fieldToCompare, valueToCompare) =>
  value =>
    (value !== valueToCompare)
      ? `{${field}}_AND_{${fieldToCompare}}_FIELDS_SHOULD_MATCH`
      : undefined

export const shouldNotMatch = (field, fieldToCompare, valueToCompare) =>
  value =>
    (value === valueToCompare)
      ? `{${field}}_AND_{${fieldToCompare}}_FIELDS_SHOULDNT_MATCH`
      : undefined

export const minValue = min =>
  value =>
    isNaN(value) || value > min
      ? undefined
      : `VALUE_SHOULD_BE_GREATER_EQUAL_THAN_{${min}}`


export const maxValue = max =>
  value =>
    isNaN(value) || value < max
      ? undefined
      : `VALUE_SHOULD_BE_SMALLER_EQUAL_THAN_{${max}}`

export const rangeValues = (min, max) =>
  value =>
    isNaN(value) || (value >= min && value <= max) 
      ? undefined
      : `VALUE_SHOULD_BE_BETWEEN_{${min}}_AND_{${max}}`

export const emailFormat = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'INCORRECT_EMAIL_FORMAT'

export const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

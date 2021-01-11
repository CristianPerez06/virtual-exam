import { ERROR_FIELDS } from '../common/constants'

export const required = (value) => (value ? undefined : ERROR_FIELDS.REQUIRED)

export const mustBeNumber = value => (isNaN(value) ? ERROR_FIELDS.MUST_BE_A_NUMBER : undefined)

export const shouldMatch = (valueToCompare) =>
  value =>
    (value !== valueToCompare)
      ? ERROR_FIELDS.FIELDS_SHOULD_MATCH
      : undefined

export const shouldNotMatch = (valueToCompare) =>
  value =>
    (value === valueToCompare)
      ? ERROR_FIELDS.FIELDS_SHOULDNT_MATCH
      : undefined

export const minValue = min =>
  value =>
    isNaN(value) || value > min
      ? undefined
      : 'VALUE_SHOULD_BE_GREATER_EQUAL_THAN'

export const maxValue = max =>
  value =>
    isNaN(value) || value < max
      ? undefined
      : 'VALUE_SHOULD_BE_SMALLER_EQUAL_THAN'

export const rangeValues = (min, max) =>
  value =>
    isNaN(value) || (value >= min && value <= max)
      ? undefined
      : 'VALUE_SHOULD_BE_BETWEEN'

export const emailFormat = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : ERROR_FIELDS.INCORRECT_EMAIL_FORMAT

export const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

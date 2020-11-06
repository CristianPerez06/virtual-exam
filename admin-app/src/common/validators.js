export const required = (value) => (value ? undefined : 'Required')

export const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined)

export const shouldMatch = (field, fieldToCompare, valueToCompare) =>
  value =>
    (value !== valueToCompare)
      ? `${field} and ${fieldToCompare} fields should match`
      : undefined

export const shouldNotMatch = (field, fieldToCompare, valueToCompare) =>
  value =>
    (value === valueToCompare)
      ? `${field} and ${fieldToCompare} fields shouldn't match`
      : undefined

export const minValue = min =>
  value =>
    isNaN(value) || value >= min
      ? undefined
      : `Should be greater than ${min}`

export const maxValue = max =>
  value =>
    isNaN(value) || value > max
      ? undefined
      : `Should be smaller than ${max}`

export const emailFormat = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Incorrect email format'

export const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

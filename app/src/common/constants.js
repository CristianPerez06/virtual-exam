export const TIME = {
  A_MINUTE: 60,
  HALF_HOUR: 1800,
  AN_HOUR: 3600
}

export const ACCOUNT_ACTION_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REFRESH: 'REFRESH'
}

export const COGNITO_ERROR_CODES = {
  USERNAME_EXISTS: 'UsernameExistsException',
  NOT_AUTHORIZED: 'NotAuthorizedException',
  NEW_PASSWORD_REQUIRED: 'newPasswordRequired',
  INVALID_PARAMETER_EXCEPTION: 'InvalidParameterException',
  INVALID_PASSWORD_EXCEPTION: 'InvalidPasswordException',
  CODE_MISMATCH_EXCEPTION: 'CodeMismatchException'
}

export const ID_LENGTH = {
  MIN: 1,
  MAX: 99999
}

export const ERROR_FIELDS = {
  REQUIRED: 'required',
  MUST_BE_A_NUMBER: 'must_be_a_number',
  INCORRECT_EMAIL_FORMAT: 'incorrect_email_format',
  FIELDS_SHOULD_MATCH: 'fields_should_match',
  FIELDS_SHOULDNT_MATCH: 'fields_shouldnt_match'
}

export const ERROR_MESSAGES = {
  DUPLICATED_ENTITY: 'duplicated_entity',
  INTERNAL_SERVER_ERROR: 'internal_server_error'
}

export const LOCALE = {
  ES: 'es',
  EN: 'en'
}

import { ERROR_MESSAGES } from '../common/constants'

export const getTranslatableErrors = (gqlErrors) => {
  const translatableErrors = gqlErrors.map(error => {
    const errorCode = ((error || {}).extensions || {}).code || ''
    switch (errorCode) {
      case ERROR_MESSAGES.DUPLICATED_ENTITY:
        return { id: errorCode, translatableMessageId: 'common_error.duplicated_entity' }
      default:
        return { id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, translatableMessageId: 'common_error.internal_server_error' }
    }
  })
  if (translatableErrors.length === 0) {
    translatableErrors.push({ id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, translatableMessageId: 'common_error.internal_server_error' })
  }

  return translatableErrors
}

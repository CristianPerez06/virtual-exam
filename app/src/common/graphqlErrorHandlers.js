import { ERROR_MESSAGES } from '../common/constants'

export const getTranslatableErrors = (gqlErrors) => {
  const translatableErrors = gqlErrors.map(error => {
    const errorCode = ((error || {}).extensions || {}).code || ''
    switch (errorCode) {
      case ERROR_MESSAGES.DUPLICATED_ENTITY:
        return { id: 'common_error.duplicated_entity', message: errorCode }
      case ERROR_MESSAGES.CORRECT_ANSWER_ALREADY_SELECTED:
        return { id: 'entity_error.correct_answer_already_selected', message: errorCode }
      default:
        return { id: 'common_error.internal_server_error', message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }
    }
  })
  if (translatableErrors.length === 0) {
    translatableErrors.push({ id: 'common_error.internal_server_error', message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR })
  }

  return translatableErrors
}

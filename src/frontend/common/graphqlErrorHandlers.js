import { ERROR_MESSAGES } from '../common/constants'

export const getTranslatableErrors = (gqlErrors) => {
  const translatableErrors = gqlErrors.map(error => {
    const { message } = error
    switch (message) {
      case ERROR_MESSAGES.DUPLICATED_ENTITY:
        return { id: 'common_error.duplicated_entity', message: message }
      case ERROR_MESSAGES.CORRECT_ANSWER_ALREADY_SELECTED:
        return { id: 'entity_error.correct_answer_already_selected', message: message }
      case ERROR_MESSAGES.RELATED_ENTITY_EXISTS:
        return { id: 'entity_error.related_entity_exists', message: message }
      default:
        return { id: 'common_error.internal_server_error', message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }
    }
  })
  if (translatableErrors.length === 0) {
    translatableErrors.push({ id: 'common_error.internal_server_error', message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR })
  }

  return translatableErrors
}

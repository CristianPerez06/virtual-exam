const BACKEND_ERRORS = {
  DUPLICATED_ENTITY: 'duplicated_entity',
  DELETE_FAILED: 'delete_failed',
  PARAMETER_NOT_PROVIDED: 'parameter_not_provided',
  CORRECT_ANSWER_ALREADY_SELECTED: 'correct_answer_already_selected',
  RELATED_ENTITY_EXISTS: 'related_entity_exists'
}

const EXERCISES_VALIDATION_PARAMETERS = {
  NOTE_ZERO: 0,
  NOTE_ALMOST_TEN: 9.99,
  NOTE_TEN: 10,
  MINIMUM_ANSWERS_AMOUNT: 2
}

module.exports = {
  BACKEND_ERRORS,
  EXERCISES_VALIDATION_PARAMETERS
}

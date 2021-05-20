const BACKEND_ERRORS = {
  DUPLICATED_ENTITY: {
    Code: 'duplicated_entity',
    Message: 'Duplicated entity'
  },
  DELETE_FAILED: {
    Code: 'delete_failed',
    Message: 'Delete failed'
  },
  PARAMETER_NOT_PROVIDED: {
    Code: 'parameter_not_provided',
    Message: 'Parameter not provided'
  },
  CORRECT_ANSWER_ALREADY_SELECTED: {
    Code: 'correct_answer_already_selected',
    Message: 'A correct answer was already selected'
  }
}

module.exports = {
  BACKEND_ERRORS
}

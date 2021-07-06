import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { Loading, ReadOnlyExam } from '../../components/common'
import { injectIntl } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { GET_EXAM } from '../../common/requests/exams'
import { useAlert } from '../../hooks'

const ViewExam = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()

  // Hooks
  const { alertError } = useAlert()

  // State
  const [exam, setExam] = useState()

  // Handlers
  const onSuccess = (result) => {
    if (!result) return
    setExam(result.getExam)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM,
    {
      variables: { id: params.examId },
      skip: !params.examId,
      fetchPolicy: 'network-only',
      onCompleted: onSuccess,
      onError
    }
  )

  if (fetching) return <Loading />

  return (
    <div className='view-exam border shadow p-3 mb-3 bg-white rounded'>
      {!fetching && exam && <ReadOnlyExam exam={exam} goBackPath='/students/manage-exams' />}
    </div>
  )
}

export default injectIntl(ViewExam)

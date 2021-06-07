import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { Loading, CustomAlert, ReadOnlyExam } from '../../components/common'
import { injectIntl } from 'react-intl'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { GET_EXAM } from '../../common/requests/exams'

const ViewExam = (props) => {
  // Props and params
  const { params } = useRouteMatch()

  // State
  const [exam, setExam] = useState()
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    if (!result) return
    setExam(result.getExam)
    setErrors()
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM,
    {
      variables: { id: params.id },
      skip: !params.id,
      fetchPolicy: 'network-only',
      onCompleted: onSuccess,
      onError
    }
  )

  if (fetching) return <Loading />

  return (
    <div className='view-exam border shadow p-3 mb-3 bg-white rounded' style={{ width: 850 + 'px' }}>
      {!fetching && exam && <ReadOnlyExam exam={exam} parent='student-exams' />}
      {errors && <CustomAlert messages={errors} className='ml-3' />}
    </div>
  )
}

export default injectIntl(ViewExam)

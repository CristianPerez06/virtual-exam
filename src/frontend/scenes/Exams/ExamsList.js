import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_ASSIGNED_EXAMS } from '../../common/requests/assignedExams'
import { CREATE_EXAM, LIST_EXAMS } from '../../common/requests/exams'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ModalWrapper, TranslatableErrors } from '../../components/common'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { COOKIE_NAMES } from '../../common/constants'
import { syncCacheOnCreate, syncCacheOnDeleteAssignedExam } from './cacheHelpers'
import Cookies from 'js-cookie'
import TableExams from './components/TableExams'
import TablePendingExams from './components/TablePendingExams'

const ExamsList = (props) => {
  // Props and params
  const idNumber = Cookies.get(COOKIE_NAMES.USER)

  // State
  const [assignedExams, setAssignedExams] = useState([])
  const [exams, setExams] = useState([])
  const [errors, setErrors] = useState()
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false)
  const [filters, setFilters] = useState({})

  // Button handlers
  const onStartClicked = (values) => {
    const { id, examTemplateId } = values
    setFilters({ assignedExamId: id, examTemplateId, idNumber })
    setErrors()
    setConfirmModalIsOpen(true)
  }

  const onConfirmStartClicked = () => {
    createExam({
      variables: { ...filters },
      update: (cache, result) => {
        // Update AssignedExams Cache
        const variables = { idNumber: idNumber }
        const updatedExamsList = syncCacheOnCreate(cache, result.data.createExam, variables)

        // Update Exams Cache
        const assignedExamItem = { id: filters.assignedExamId, __typename: 'AssignedExam' }
        const updatedAssignedExamsList = syncCacheOnDeleteAssignedExam(cache, assignedExamItem, variables)

        setAssignedExams(updatedAssignedExamsList.data)
        setExams(updatedExamsList.data)
      }
    })
    setConfirmModalIsOpen(false)
  }

  const onCancelClicked = () => {
    // if (deleting) return
    setFilters({})
    setErrors()
    setConfirmModalIsOpen(!confirmModalIsOpen)
  }

  // Handlers
  const onSuccess = (result) => {
    setErrors()
  }

  const onFetchAssignedExamsSuccess = (result) => {
    if (!result) return
    setAssignedExams(result.listAssignedExams.data)
  }

  const onFetchExamsSuccess = (result) => {
    if (!result) return
    setExams(result.listExams.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)
    setErrors(translatableErrors)
    setConfirmModalIsOpen(false)
  }

  // Queries and mutations
  const { loading: fetchingAssignedExams } = useQuery(
    LIST_ASSIGNED_EXAMS,
    {
      variables: { idNumber: idNumber },
      onCompleted: onFetchAssignedExamsSuccess,
      onError
    }
  )
  const { loading: fetchingExams } = useQuery(
    LIST_EXAMS,
    {
      variables: { idNumber: idNumber },
      onCompleted: onFetchExamsSuccess,
      onError
    }
  )
  const [createExam, { loading: creating }] = useMutation(CREATE_EXAM, { onCompleted: onSuccess, onError })

  return (
    <div className='exams-list' style={{ width: 850 + 'px' }}>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.assigned_exams' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column'>
          {/* Tables */}
          <TablePendingExams
            loading={fetchingAssignedExams}
            assignedExams={assignedExams}
            disableButtons={creating}
            onStartClicked={onStartClicked}
          />
          <TableExams
            loading={fetchingExams}
            exams={exams}
            disableButtons={creating}
          />

          {/* Delete modal */}
          <div id='delete-modal'>
            <ModalWrapper
              modalIsOpen={confirmModalIsOpen}
              headerTextId='common_title.start_exam_confirmation'
              bodyTextId='confirm_start_exam'
              buttonTextId='button.confirm_start'
              buttonColor='success'
              onCloseClick={() => onCancelClicked()}
              onConfirmClick={() => onConfirmStartClicked()}
            />
          </div>
        </CardBody>
      </Card>
      <div id='info' className='d-flex justify-content-around mt-2 w-100'>
        {errors && <TranslatableErrors errors={errors} className='ml-3' />}
      </div>
    </div>
  )
}

export default injectIntl(ExamsList)

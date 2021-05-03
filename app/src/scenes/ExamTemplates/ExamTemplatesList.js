import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_EXAM_TEMPLATES, DISABLE_EXAM_TEMPLATE } from '../../common/requests/templates'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, TranslatableErrors, DeleteModal, TwoColumnsTable } from '../../components/common'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const ExamTemplatesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [templates, setTemplates] = useState([])
  const [errors, setErrors] = useState(null)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [templateDeleted, setTemplateDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Handlers
  const onCompleted = (res) => {
    if (!res) return
    setTemplates(res.listExamTemplates.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
    setTemplateDeleted(false)
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (course) => {
    setTemplateToDelete(course)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    disableExamTemplate({
      variables: { id: templateToDelete.id },
      update: (cache, result) => {
        const updatedTemplatesList = syncCacheOnDelete(cache, templateToDelete)
        setTemplates(updatedTemplatesList.data)
      }
    })
  }

  const onCancelClicked = () => {
    if (deleting) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  // Other
  const stateCleanupOnDelete = () => {
    setErrors()
    setDeleteModalIsOpen(false)
    setTemplateDeleted(true)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(LIST_EXAM_TEMPLATES, { variables: {}, onCompleted, onError })
  const [disableExamTemplate, { loading: deleting }] = useMutation(DISABLE_EXAM_TEMPLATE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='exam-templates-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.exam_templates' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            <TwoColumnsTable
              entityName='exam_template'
              entitiesPath='exam-templates'
              items={templates}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />

            {/* Delete modal */}
            <div id='delete-modal'>
              <DeleteModal
                modalIsOpen={deleteModalIsOpen}
                isBussy={deleting}
                onCloseClick={() => onCancelClicked()}
                onDeleteClick={() => onDeleteConfirmClicked()}
              />
            </div>

            {/* Alerts */}
            {!deleting && templateDeleted && <CustomAlert messages={{ id: 'exercise_deleted', message: `${formatMessage({ id: 'exercise_deleted' })}: ${templateToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(ExamTemplatesList)

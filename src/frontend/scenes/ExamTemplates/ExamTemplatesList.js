import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES } from '../../common/requests/courses'
import { LIST_EXAM_TEMPLATES, DISABLE_EXAM_TEMPLATE } from '../../common/requests/templates'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { DeleteModal, TwoColumnsTable, LoadingInline } from '../../components/common'
import Select from 'react-select'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { useAlert } from '../../hooks'

const ExamTemplatesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // Hooks
  const { alertSuccess, alertError } = useAlert()

  // State
  const [templates, setTemplates] = useState([])
  const [courses, setCourses] = useState([])
  const [filters, setFilters] = useState({ selectedCourse: null })
  const [templateToDelete, setTemplateToDelete] = useState()
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // Handlers
  const onCompleted = (res) => {
    if (!res) return
    setTemplates(res.listExamTemplates.data)
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    const mappedCourses = result.listCourses.data.map((course) => {
      return {
        value: course.id,
        label: course.name
      }
    })
    setCourses(mappedCourses)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    alertError(formatMessage({ id: translatableError.id }))
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
        const variables = { courseId: filters.selectedCourse.value }
        const updatedTemplatesList = syncCacheOnDelete(cache, templateToDelete, variables)
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
    setDeleteModalIsOpen(false)
    alertSuccess(formatMessage({ id: 'exam_template_deleted' }))
  }

  // Queries and mutations
  const { loading: fetchingCourses } = useQuery(LIST_COURSES, { variables: {}, onCompleted: onFetchCoursesSuccess, onError })
  const { loading: fetching } = useQuery(
    LIST_EXAM_TEMPLATES,
    {
      variables: { courseId: (filters.selectedCourse || {}).value },
      skip: !filters.selectedCourse,
      onCompleted,
      onError
    }
  )
  const [disableExamTemplate, { loading: deleting }] = useMutation(DISABLE_EXAM_TEMPLATE, { onCompleted: stateCleanupOnDelete, onError })

  return (
    <div className='exam-templates-list shadow mb-3 bg-white rounded'>
      <Card className='mx-auto'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='common_entity.exam_templates' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column text-center'>
          <div className='row d-flex justify-content-center mb-4'>
            <div className='col-md-10 col-xs-12'>
              <span className='text-left pl-1 pb-1'>
                <FormattedMessage id='common_entity.course' />
              </span>
              <Select
                value={filters.selectedCourse}
                options={courses}
                isDisabled={fetchingCourses}
                onChange={(option) => {
                  const selected = courses.find(x => x.value === option.value)
                  setFilters({ selectedCourse: selected })
                }}
              />
            </div>
          </div>

          {fetching && <div className='text-center'><LoadingInline color='grey' /></div>}
          {!fetching && (
            <TwoColumnsTable
              entityName='exam_template'
              entitiesPath='exam-templates'
              items={templates}
              canEdit
              canDelete
              onDeleteClicked={onDeleteClicked}
            />
          )}

          {/* Delete modal */}
          <div id='delete-modal'>
            <DeleteModal
              modalIsOpen={deleteModalIsOpen}
              isBussy={deleting}
              onCloseClick={() => onCancelClicked()}
              onDeleteClick={() => onDeleteConfirmClicked()}
            />
          </div>

        </CardBody>
      </Card>

    </div>
  )
}

export default injectIntl(ExamTemplatesList)

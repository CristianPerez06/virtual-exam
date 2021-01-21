import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_COURSES, DELETE_COURSE } from './requests'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { ERROR_MESSAGES } from '../../common/constants'
import { Loading, LoadingInline, CustomAlert, Table } from '../../components/common'
import { Link } from 'react-router-dom'

const CoursesList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [courses, setCourses] = useState()
  const [errors, setErrors] = useState()
  const [courseToDelete, setCourseToDelete] = useState()
  const [courseDeleted, setCourseDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // handlers
  const onCompleted = (data) => {
    if (!data) return
    setCourses(data.listCourses)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatedErrors = graphQLErrors.map(error => {
      const errorCode = ((error || {}).extensions || {}).code || ''
      switch (errorCode) {
        default:
          return { id: ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message: formatMessage({ id: 'common_error.internal_server_error' }) }
      }
    })

    setErrors(translatedErrors)
    setCourseDeleted(false)
    setDeleteModalIsOpen(false)
  }

  const onDeleteSuccess = () => {
    setErrors()
    setDeleteModalIsOpen(false)
    setCourseDeleted(true)
  }

  const onDelete = (course) => {
    setCourseToDelete(course)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirm = () => {
    deleteCourse({ variables: { id: courseToDelete.id } })
  }

  const toggleModal = () => {
    if (deleting) return
    setDeleteModalIsOpen(!deleteModalIsOpen)
  }

  // Queries and mutations
  const { loading: fetching, fetchMore } = useQuery(LIST_COURSES, { variables: { q: '', offset: 0, limit: 100 }, onCompleted, onError })
  const [deleteCourse, { loading: deleting }] = useMutation(DELETE_COURSE, { onCompleted: onDeleteSuccess, onError })

  useEffect(() => {
    fetchMore({
      query: LIST_COURSES,
      variables: { q: '', offset: 0, limit: 100 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (fetchMoreResult) {
          const { listCourses } = fetchMoreResult
          setCourses(listCourses)
          // TO DO - Implement Apollo Cache
          // return { listCourses }
        }
        // return { ...prev }
      }
    })
  }, [courseDeleted, fetchMore])

  const columnTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.courseName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/course/edit/${row.original.id}`}>
              <Button color='info'>{columnTranslations.edit}</Button>
            </Link>
            <Button
              className='ml-1'
              color='danger'
              onClick={() => onDelete({ ...row.original })}
            >
              {columnTranslations.delete}
            </Button>
          </div>
        )
      }]
    },
    [columnTranslations]
  )

  return (
    <div className='course-list'>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.courses' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            {/* Table */}
            <Table
              columns={columns}
              data={courses}
            />

            {/* Modal */}
            <div id='modal'>
              <Modal isOpen={deleteModalIsOpen} toggle={toggleModal} disabled>
                <ModalHeader toggle={toggleModal} disabled>
                  {formatMessage({ id: 'common_title.delete_confirmation' })}
                </ModalHeader>
                <ModalBody>
                  {formatMessage({ id: 'delete_this_record' })}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color='danger'
                    onClick={onDeleteConfirm}
                    disabled={deleting}
                  >
                    {formatMessage({ id: 'button.delete' })}
                    {deleting && <LoadingInline className='ml-3' />}
                  </Button>
                  <Button
                    color='secondary'
                    onClick={toggleModal}
                    disabled={deleting}
                  >
                    {formatMessage({ id: 'button.cancel' })}
                  </Button>
                </ModalFooter>
              </Modal>
            </div>

            {/* Alerts */}
            {!deleting && courseDeleted && <CustomAlert messages={{ id: 'course_deleted', message: `${formatMessage({ id: 'course_deleted' })}: ${courseToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <CustomAlert messages={errors} />}
    </div>
  )
}

export default injectIntl(CoursesList)

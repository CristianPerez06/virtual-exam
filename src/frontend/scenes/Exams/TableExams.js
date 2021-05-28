import React from 'react'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Loading, Table, NoResults } from '../../components/common'
import { Button } from 'reactstrap'
import { format } from 'date-fns'

const TableExams = (props) => {
  const {
    loading,
    exams,
    disableButtons,
    intl
  } = props

  const { formatMessage } = intl

  const columnTranslations = {
    dateStarted: formatMessage({ id: 'date_started' }),
    dateFinished: formatMessage({ id: 'date_finished' }),
    courseName: formatMessage({ id: 'course_name' }),
    examName: formatMessage({ id: 'exam_name' }),
    action: formatMessage({ id: 'action' }),
    goToExam: formatMessage({ id: 'button.go_to_exam' }),
    goToExamDetails: formatMessage({ id: 'button.go_to_exam_details' })
  }

  const columns = React.useMemo(
    () => {
      return [
        {
          Header: columnTranslations.dateStarted,
          accessor: 'dateStarted',
          Cell: ({ row }) => format(new Date(row.original.created), 'yyyy-MM-dd')
        },
        {
          Header: columnTranslations.dateFinished,
          accessor: 'dateFinished',
          Cell: ({ row }) => {
            return (row.original.updated && row.original.completed === true)
              ? format(new Date(row.original.updated), 'yyyy-MM-dd')
              : '-'
          }
        },
        {
          Header: columnTranslations.courseName,
          accessor: 'courseName',
          Cell: ({ row }) => 'TO DO - Get course name'
        },
        {
          Header: columnTranslations.examName,
          accessor: 'name',
          Cell: ({ row }) => row.values.name
        },
        {
          Header: columnTranslations.action,
          Cell: ({ row }) => {
            return (
              <div className='d-flex justify-content-center'>
                {row.original.updated && row.original.completed === true
                  ? (
                    <Link to={`/exams/${row.original.id}/details`}>
                      <Button color='outline-secondary' className='m-2' disabled={disableButtons}>
                        {columnTranslations.goToExamDetails}
                      </Button>
                    </Link>
                  )
                  : (
                    <Link to={`/exams/${row.original.id}`}>
                      <Button color='secondary' className='m-2' disabled={disableButtons}>
                        {columnTranslations.goToExam}
                      </Button>
                    </Link>
                  )}
              </div>
            )
          }
        }
      ]
    },
    [columnTranslations, disableButtons]
  )

  return (
    <div className='row mt-3'>
      <div className='col-md-12 col-xs-12'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='exams_initiated_finalized' />
        </p>
        {loading && <Loading />}
        {!loading && exams.length === 0 && <NoResults />}
        {!loading && exams.length !== 0 && <Table columns={columns} data={exams} paginationEnabled={false} />}
      </div>
    </div>
  )
}

export default injectIntl(TableExams)

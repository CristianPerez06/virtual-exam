import React from 'react'
import { Link } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Loading, Table, NoResults } from '../../components/common'
import { Button } from 'reactstrap'

const TableExams = (props) => {
  const {
    loading,
    exams,
    disableButtons,
    intl
  } = props

  const { formatMessage } = intl

  const columnTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    examName: formatMessage({ id: 'exam_name' }),
    action: formatMessage({ id: 'action' }),
    goToExam: formatMessage({ id: 'button.go_to_exam' })
  }

  const columns = React.useMemo(
    () => {
      return [
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
          Cell: ({ row }) => (
            <div className='d-flex justify-content-center'>
              <Link to={`/exams/${row.original.id}`}>
                <Button
                  color='secondary'
                  className='m-2'
                  disabled={disableButtons}
                >
                  {columnTranslations.goToExam}
                </Button>
              </Link>
            </div>
          )
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

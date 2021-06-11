import React from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Loading, Table, NoResults } from '../../../components/common'
import { Button } from 'reactstrap'

const TablePendingExams = (props) => {
  const {
    loading,
    assignedExams,
    disableButtons,
    onStartClicked,
    intl
  } = props

  const { formatMessage } = intl

  const columnTranslations = {
    courseName: formatMessage({ id: 'course_name' }),
    examTemplateName: formatMessage({ id: 'exam_template_name' }),
    action: formatMessage({ id: 'action' }),
    start: formatMessage({ id: 'button.start' })
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
          Header: columnTranslations.examTemplateName,
          accessor: 'examTemplateName',
          Cell: ({ row }) => row.values.examTemplateName
        },
        {
          Header: columnTranslations.action,
          Cell: ({ row }) => (
            <div className='d-flex justify-content-center'>
              <Button
                className='ml-1'
                color='primary'
                disabled={disableButtons}
                onClick={() => {
                  onStartClicked({ ...row.original })
                }}
              >
                {columnTranslations.start}
              </Button>
            </div>
          )
        }
      ]
    },
    [columnTranslations, disableButtons, onStartClicked]
  )

  return (
    <div className='row'>
      <div className='col-md-12 col-xs-12'>
        <p className='text-center h5 mb-0'>
          <FormattedMessage id='pending_exams' />
        </p>
        {loading && <Loading />}
        {!loading && assignedExams.length === 0 && <NoResults />}
        {!loading && assignedExams.length !== 0 && <Table columns={columns} data={assignedExams} />}
      </div>
    </div>
  )
}

export default injectIntl(TablePendingExams)

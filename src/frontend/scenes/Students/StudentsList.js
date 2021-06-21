import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useAuthContext } from '../../hooks'
import { Link } from 'react-router-dom'
import { Loading, TranslatableErrors, Table, NoResults } from '../../components/common'
import { ROLES } from './../../common/constants'

const StudentsList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // Hooks
  const { cognito } = useAuthContext()

  // State
  const [students, setStudents] = useState([])
  const [errors, setErrors] = useState()
  const [fetching, setFetching] = useState(true)

  // Handlers
  const onSuccess = (data) => {
    // TO DO - Handle error when no users where returned from AWS
    const { Users } = data

    // Admin users should be displayed in Students list
    const filteredUsers = Users.filter(user => {
      const userAttr = user.Attributes.find(x => x.Name === 'custom:role')
      return userAttr.Value === ROLES.GUEST ? user : null
    })

    const studentsList = filteredUsers.map((user) => {
      return {
        idNumber: user.Username,
        completeName: user.Attributes.find(x => x.Name === 'name').Value + ' ' + user.Attributes.find(x => x.Name === 'family_name').Value
      }
    })
    setStudents(studentsList)
    setErrors()
    setFetching(false)
  }

  const onError = (err) => {
    console.log(err)
    setFetching(false)
    setErrors([{ id: 'common_error.internal_server_error' }])
  }

  const columnTranslations = {
    idNumber: formatMessage({ id: 'student_id_number' }),
    student: formatMessage({ id: 'common_entity.student' }),
    action: formatMessage({ id: 'action' }),
    manage: formatMessage({ id: 'button.manage_exams' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.idNumber,
        accessor: 'idNumber',
        Cell: ({ row }) => row.values.idNumber
      },
      {
        Header: columnTranslations.student,
        accessor: 'completeName',
        Cell: ({ row }) => row.values.completeName
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/students/manage-exams/${row.original.idNumber}`}>
              <Button color='info'>{columnTranslations.manage}</Button>
            </Link>
          </div>
        )
      }]
    },
    [columnTranslations]
  )

  useEffect(() => {
    const getUsers = () => {
      cognito.getUsersList()
        .then(data => onSuccess(data))
        .catch(err => onError(err))
    }

    getUsers()
  }, [cognito])

  return (
    <div className='students-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto shadow mb-3 bg-white rounded'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.students' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column'>
            <div id='students-list'>
              {students.length === 0
                ? <NoResults />
                : <Table columns={columns} data={students} />}
            </div>
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(StudentsList)

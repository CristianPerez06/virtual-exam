import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LIST_UNITS, DISABLE_UNIT } from '../../common/requests/units'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Loading, CustomAlert, TranslatableErrors, Table, DeleteModal } from '../../components/common'
import { Link } from 'react-router-dom'
import { syncCacheOnDelete } from './cacheHelpers'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'

const UnitsList = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // State
  const [units, setUnits] = useState([])
  const [errors, setErrors] = useState(null)
  const [unitToDelete, setUnitToDelete] = useState(null)
  const [unitDeleted, setUnitDeleted] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)

  // handlers
  const onCompleted = (res) => {
    if (!res) return
    setUnits(res.listUnits.data)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
    setUnitDeleted(false)
    setDeleteModalIsOpen(false)
  }

  // Button handlers
  const onDeleteClicked = (unit) => {
    setUnitToDelete(unit)
    setDeleteModalIsOpen(true)
  }

  const onDeleteConfirmClicked = () => {
    disableUnit({
      variables: { id: unitToDelete.id },
      update: (cache, result) => {
        const updatedUnitList = syncCacheOnDelete(cache, unitToDelete)
        setUnits(updatedUnitList.data)
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
    setUnitDeleted(true)
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(LIST_UNITS, { variables: {}, onCompleted, onError })
  const [disableUnit, { loading: deleting }] = useMutation(DISABLE_UNIT, { onCompleted: stateCleanupOnDelete, onError })

  const columnTranslations = {
    unitName: formatMessage({ id: 'unit_name' }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.unitName,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            <Link to={`/units/${row.original.id}`}>
              <Button color='info'>{columnTranslations.edit}</Button>
            </Link>
            <Button
              className='ml-1'
              color='danger'
              onClick={() => onDeleteClicked({ ...row.original })}
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
    <div className='units-list' style={{ width: 850 + 'px' }}>
      {fetching && <Loading />}
      {!fetching &&
        <Card className='mx-auto'>
          <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
            <p className='h4'>
              <FormattedMessage id='common_entity.units' />
            </p>
          </CardHeader>
          <CardBody className='d-flex flex-column text-center'>
            {units.length === 0
              ? <div id='no-results' className='text-center mb-3'><FormattedMessage id='common_message.no_results' /></div>
              : <Table columns={columns} data={units} />}

            {/* Delete dodal */}
            <div id='delete-modal'>
              <DeleteModal
                modalIsOpen={deleteModalIsOpen}
                isBussy={deleting}
                onCloseClick={() => onCancelClicked()}
                onDeleteClick={() => onDeleteConfirmClicked()}
              />
            </div>

            {/* Alerts */}
            {!deleting && unitDeleted && <CustomAlert messages={{ id: 'unit_deleted', message: `${formatMessage({ id: 'unit_deleted' })}: ${unitToDelete.name}` }} color='success' />}
          </CardBody>
        </Card>}
      {errors && <TranslatableErrors errors={errors} />}
    </div>
  )
}

export default injectIntl(UnitsList)

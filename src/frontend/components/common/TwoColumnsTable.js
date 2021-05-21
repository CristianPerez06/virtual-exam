import React from 'react'
import { Button } from 'reactstrap'
import { Table } from '../../components/common'
import { injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import NoResults from './NoResults'

const TwoColumnsTable = (props) => {
  const {
    entityName,
    entitiesPath,
    items,
    canEdit = true,
    canDelete = true,
    onDeleteClicked,
    paginationEnabled = true,
    intl
  } = props

  const { formatMessage } = intl

  const columnTranslations = {
    name: formatMessage({ id: `${entityName}_name` }),
    action: formatMessage({ id: 'action' }),
    edit: formatMessage({ id: 'button.edit' }),
    delete: formatMessage({ id: 'button.delete' })
  }

  const columns = React.useMemo(
    () => {
      return [{
        Header: columnTranslations.name,
        accessor: 'name',
        Cell: ({ row }) => row.values.name
      },
      {
        Header: columnTranslations.action,
        Cell: ({ row }) => (
          <div className='d-flex justify-content-center'>
            {canEdit && (
              <Link to={`/${entitiesPath}/${row.original.id}`}>
                <Button color='info'>{columnTranslations.edit}</Button>
              </Link>
            )}
            {canDelete && (
              <Button
                className='ml-1'
                color='danger'
                onClick={() => {
                  onDeleteClicked({ ...row.original })
                }}
              >
                {columnTranslations.delete}
              </Button>
            )}
          </div>
        )
      }]
    },
    [columnTranslations, canEdit, canDelete, entitiesPath, onDeleteClicked]
  )

  return (
    <div className='two-columns-table'>
      {items.length === 0
        ? <NoResults />
        : <Table columns={columns} data={items} paginationEnabled={paginationEnabled} />}
    </div>
  )
}

export default injectIntl(TwoColumnsTable)

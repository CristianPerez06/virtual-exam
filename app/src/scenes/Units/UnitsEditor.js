import React, { useState, useEffect } from 'react'
import { Form } from 'react-final-form'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { CustomAlert, TranslatableErrors, ButtonSubmit, ButtonGoTo, FieldWrapper, SelectWrapper, TranslatableTitle } from '../../components/common'
import { required } from '../../common/validators'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { injectIntl, FormattedMessage } from 'react-intl'
import { CREATE_UNIT, UPDATE_UNIT, GET_UNIT } from '../../common/requests/units'
import { LIST_COURSES } from '../../common/requests/courses'
import { syncCacheOnCreate, syncCacheOnUpdate } from './cacheHelpers'

const UnitsEditor = (props) => {
  // Props and params
  const { isCreating, intl } = props
  const { formatMessage } = intl
  const { params } = useRouteMatch()
  const history = useHistory()

  // State
  const [unitCreated, setUnitCreated] = useState(false)
  const [unitUpdated, setUnitUpdated] = useState(false)
  const [courses, setCourses] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const [filters, setFilters] = useState({})
  const [errors, setErrors] = useState()

  // Handlers
  const onSuccess = (result) => {
    const { id } = isCreating ? result.createUnit : result.updateUnit
    if (isCreating) {
      setUnitCreated(true)
      setUnitUpdated(false)
      history.push({
        pathname: `/units/${id}`,
        state: { isCreating: false }
      })
    } else {
      setUnitCreated(false)
      setUnitUpdated(true)
    }
    setErrors()
  }

  const onFetchUnitSuccess = (result) => {
    if (!result) return
    const unit = { ...result.getUnit }
    setInitialValues(unit)
    setFilters({ selectedCourse: unit.courseId })
  }

  const onFetchCoursesSuccess = (result) => {
    if (!result) return
    setCourses(result.listCourses.data)
  }

  const onError = (err) => {
    setUnitCreated(false)
    setUnitUpdated(false)

    const { graphQLErrors } = err
    const translatableErrors = getTranslatableErrors(graphQLErrors)

    setErrors(translatableErrors)
  }

  const onSubmit = (values) => {
    const { name, courseId } = values
    isCreating
      ? createUnit({
        variables: { name: name, courseId: courseId },
        update: (cache, result) => {
          syncCacheOnCreate(cache, result.data.createUnit)
        }
      })
      : updateUnit({
        variables: { id: params.id, name: name, courseId: courseId },
        update: (cache, result) => {
          syncCacheOnUpdate(cache, result.data.updateUnit)
        }
      })
  }

  const validateBeforeSubmit = (values) => {
    const errors = {}
    if (!values.name) { errors.name = formatMessage({ id: 'common_field_error.required' }) }
    if (!values.courseId) { errors.courseId = formatMessage({ id: 'common_field_error.required' }) }
    return errors
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_UNIT,
    {
      variables: { id: params.id },
      skip: isCreating,
      onCompleted: onFetchUnitSuccess,
      onError
    }
  )
  const { loading: fetchingCourses } = useQuery(LIST_COURSES, { variables: {}, onCompleted: onFetchCoursesSuccess, onError })
  const [createUnit, { loading: creating }] = useMutation(CREATE_UNIT, { onCompleted: onSuccess, onError })
  const [updateUnit, { loading: updating }] = useMutation(UPDATE_UNIT, { onCompleted: onSuccess, onError })

  useEffect(() => {
    // State cleanup in case user was editing and now wants to create
    if (isCreating) {
      setUnitUpdated(false)
      setInitialValues({})
      setFilters({})
    }
  }, [isCreating])

  return (
    <div className='unit-editor bg-light p-5' style={{ width: 850 + 'px' }}>
      <Form
        onSubmit={onSubmit}
        validate={validateBeforeSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <TranslatableTitle isCreating={isCreating} entityName='unit' />

            <div className='row'>
              <div className='col-md-12 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='unit_name' />
                </span>
                <FieldWrapper fieldName='name' validations={required} placeHolder={formatMessage({ id: 'unit_name' })} />
              </div>
            </div>

            <div className='row d-flex justify-content-center'>
              <div className='col-md-10 col-xs-12'>
                <span className='text-left pl-1 pb-1'>
                  <FormattedMessage id='common_entity.course' />
                </span>
                <SelectWrapper
                  fieldName='courseId'
                  isDisabled={fetchingCourses}
                  options={courses}
                  validations={required}
                  selectedValue={filters.selectedCourse}
                  handleOnChange={(option) => {
                    setFilters({ ...filters, selectedCourse: option.value })
                  }}
                />
              </div>
            </div>

            <hr />

            <div id='buttons' className='d-flex justify-content-center'>
              <ButtonSubmit
                isDisabled={creating || updating || fetching || fetchingCourses || pristine}
                isLoading={creating || updating || fetching}
              />
              <ButtonGoTo
                path='/units/list'
                color='secondary'
                translatableTextId='button.go_to_list'
                isDisabled={creating || updating || fetching || fetchingCourses}
              />
            </div>

            <div id='info' className='d-flex justify-content-around mt-5'>
              {errors && <TranslatableErrors errors={errors} className='ml-3' />}
              {!creating && unitCreated && <CustomAlert messages={{ id: 'unit_created', message: formatMessage({ id: 'unit_created' }) }} color='success' />}
              {!updating && unitUpdated && <CustomAlert messages={{ id: 'unit_updated', message: formatMessage({ id: 'unit_updated' }) }} color='success' />}
            </div>

          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(UnitsEditor)

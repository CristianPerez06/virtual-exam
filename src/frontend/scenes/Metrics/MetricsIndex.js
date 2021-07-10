import React, { useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { useQuery } from '@apollo/react-hooks'
import { injectIntl, FormattedMessage } from 'react-intl'
import 'react-datepicker/dist/react-datepicker.css'
import { getTranslatableErrors } from '../../common/graphqlErrorHandlers'
import { CustomDatePicker, ChartsVerticalBar, ChartsHorizontalBar, LoadingInline } from '../../components/common'
import { GET_EXAM_METRICS, GET_EXAM_REPORTS_DATA } from '../../common/requests/metrics'
import { useAlert } from '../../hooks'
import { subMonths } from 'date-fns'
import Reports from './components/Reports'

const MetricsIndex = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  const aMonthFromNow = subMonths(new Date(), 1)
  const now = new Date()
  const verticalDataConfig = { backgroundColor: '#04A9F5', borderColor: '#04A9F5', borderWidth: 1 }
  const horizontalDataConfig = {
    passed: {
      label: formatMessage({ id: 'passed' }),
      backgroundColor: '#04A9F5',
      borderColor: '#04A9F5',
      borderWidth: 1,
      stack: 1,
      hoverBackgroundColor: '#04A9F5',
      hoverBorderColor: '#04A9F5'
    },
    failed: {
      label: formatMessage({ id: 'failed' }),
      backgroundColor: '#A8C6F5',
      borderColor: '#A8C6F5',
      borderWidth: 1,
      stack: 1,
      hoverBackgroundColor: '#A8C6F5',
      hoverBorderColor: '#A8C6F5'
    }
  }

  // State
  const [dateFrom, setDateFrom] = useState(aMonthFromNow)
  const [dateTo, setDateTo] = useState(now)
  const [error, setError] = useState(false)
  const [verticalBarData, setVerticalBarData] = useState({})
  const [horizontalBarData, setHorizontalBarData] = useState({})
  const [reportReady, setReportReady] = useState(false)

  // Hooks
  const { alertError } = useAlert()

  // Handlers
  const getVerticalBarData = (data) => {
    if (data.length === 0) {
      const emptyData = { labels: [], datasets: [{}] }
      setVerticalBarData(emptyData)
    } else {
      const sortedValues = data.sort((a, b) => b.total - a.total)
      setVerticalBarData({
        labels: sortedValues.map(x => x.courseName),
        datasets: [{
          ...verticalDataConfig,
          data: sortedValues.map(x => x.total)
        }]
      })
    }
  }

  const getHorizontalBarData = (data) => {
    if (data.length === 0) {
      const emptyData = { labels: [], datasets: [{}, {}] }
      setVerticalBarData(emptyData)
    } else {
      const sortedValues = data.sort((a, b) => b.total - a.total)
      setHorizontalBarData({
        labels: sortedValues.map(x => x.courseName),
        datasets: [
          {
            ...(horizontalDataConfig.passed),
            data: sortedValues.map(x => x.totalPassed)
          },
          {
            ...(horizontalDataConfig.failed),
            data: sortedValues.map(x => x.totalFailed)
          }
        ]
      })
    }
  }

  const onSuccess = (res) => {
    const { getExamMetrics } = res
    const { data } = getExamMetrics
    getVerticalBarData(data)
    getHorizontalBarData(data)
    setError(false)
  }

  const onReportFetched = () => {
    setReportReady(true)
  }

  const onReportError = () => {
    setReportReady(false)
  }

  const onError = (err) => {
    const { graphQLErrors } = err
    const translatableError = getTranslatableErrors(graphQLErrors)
    setError(true)
    alertError(formatMessage({ id: translatableError.id }))
  }

  const onDateFromChanged = (date) => {
    if (date > dateTo) {
      alertError(formatMessage({ id: 'common_error.selected_valid_dates' }))
    } else {
      setDateFrom(date)
    }
  }

  const onDateToChanged = (date) => {
    if (date < dateFrom) {
      alertError(formatMessage({ id: 'common_error.selected_valid_dates' }))
    } else {
      setDateTo(date)
    }
  }

  // Queries and mutations
  const { loading: fetching } = useQuery(
    GET_EXAM_METRICS,
    {
      variables: { dateFrom: dateFrom, dateTo: dateTo },
      skip: !dateFrom || !dateTo,
      fetchPolicy: 'network-only',
      onCompleted: onSuccess,
      onError
    }
  )

  const { loading: fetchingReportData } = useQuery(
    GET_EXAM_REPORTS_DATA,
    {
      variables: { dateFrom: dateFrom, dateTo: dateTo },
      skip: !dateFrom || !dateTo,
      fetchPolicy: 'network-only',
      onCompleted: onReportFetched,
      onError: onReportError
    }
  )

  return (
    <div className='metrics-list'>
      <Card className='mx-auto shadow mb-3 bg-white rounded'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='metrics' />
          </p>
        </CardHeader>
        <CardBody>
          <div className='row'>
            <div className='col-md-4 col-xs-12 text-center'>
              <span className='d-block'>
                <FormattedMessage id='date_from' />
              </span>
              <CustomDatePicker
                id='date-from'
                selectedValue={dateFrom}
                onValueChange={(date) => onDateFromChanged(date)}
                position='top-start'
              />
            </div>
            <div className='col-md-4 col-xs-12 text-center'>
              <span className='d-block'>
                <FormattedMessage id='date_to' />
              </span>
              <CustomDatePicker
                id='date-to'
                selectedValue={dateTo}
                onValueChange={(date) => onDateToChanged(date)}
                position='top-end'
              />
            </div>
            <div className='col-md-4 col-xs-12 text-center'>
              <Reports disabled={fetchingReportData || !reportReady} />
            </div>
          </div>

          {fetching && <LoadingInline />}
          {!fetching && !error && (
            <div className='charts'>
              <ChartsVerticalBar id='vertical-bar' title={formatMessage({ id: 'metrics_top_exams_per_course' })} chartData={verticalBarData} />
              <ChartsHorizontalBar id='horizontal-bar' title={formatMessage({ id: 'metrics_top_exams_passed_failed_per_course' })} chartData={horizontalBarData} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default injectIntl(MetricsIndex)

import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { COGNITO_ERROR_CODES, ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { CustomAlert } from '../../components/common'
import { useQueryParams, useAuthContext } from '../../hooks'
import PasswordChangeForm from './components/PasswordChangeForm'

const PasswordChange = (props) => {
  // props
  const queryParams = useQueryParams()
  const id = queryParams.get('id')
  const email = queryParams.get('email')

  // state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // hooks
  const { dispatch, cognito } = useAuthContext()
  const history = useHistory()

  // handlers
  const onSuccess = (data) => {
    const { accessToken } = data

    setIsLoading(false) // TO DO - Review - States are being reset before accessing onSuccess/onError.
    dispatch({
      type: ACCOUNT_ACTION_TYPES.LOGIN,
      payload: { user: accessToken.payload.username, token: accessToken.jwtToken }
    })
    history.push('/')
  }

  const onError = (err) => {
    const { code } = err
    switch (code) {
      case COGNITO_ERROR_CODES.NOT_AUTHORIZED:
        setError({ id: 'cognito_error.not_authorized_exception' })
        break
      default:
        setError({ id: 'common_error.internal_server_error' })
        break
    }
    setIsLoading(false)
  }

  const onSubmit = values => {
    const { password, newPassword } = values

    setIsLoading(true)
    cognito.loginAndChangePassword(id, password, newPassword)
      .then(data => onSuccess(data))
      .catch(err => onError(err))
  }

  return (
    <div className='password-change d-flex justify-content-center row text-center'>
      <div className='password-change-form bg-light col-md-12 col-xs-12'>
        <PasswordChangeForm isLoading={isLoading} idNumber={id} email={email} onSubmit={onSubmit} />
      </div>

      <div className='info pt-3 col-md-12 col-xs-12'>
        {!isLoading && error && <CustomAlert messages={error} />}
      </div>
    </div>
  )
}

export default injectIntl(PasswordChange)

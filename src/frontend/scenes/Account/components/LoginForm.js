import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import { required, composeValidators, mustBeNumber } from '../../../common/validators'
import { LoadingInline, FieldError, LocaleSelector } from '../../../components/common'

const LoginForm = (props) => {
  // Props and params
  const { isLoading, onSubmit, intl } = props
  const { formatMessage } = intl

  return (
    <div className='login-form'>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className='p-4'
          >
            <p className='h4 mb-4'>
              <FormattedMessage id='common_title.sign_in' />
            </p>
            <Field name='username' validate={composeValidators(required, mustBeNumber)}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder='ID'
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Field name='password' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    type='password'
                    className='form-control'
                    placeholder={formatMessage({ id: 'password' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading}>
              <FormattedMessage id='button.signin' />
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>
          </form>
        )}
      />
      <div className='d-flex justify-content-around pt-3'>
        <Link className='nav-link' to='/sign-up'>
          <FormattedMessage id='button.signup' />
        </Link>
        <Link className='nav-link' to='/forgot-password'>
          <FormattedMessage id='button.forgot_password' />
        </Link>
      </div>
      <div className='mt-2 mb-4'>
        <LocaleSelector />
      </div>
    </div>
  )
}

export default injectIntl(LoginForm)

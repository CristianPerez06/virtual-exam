import React from 'react'
import { Form, Field } from 'react-final-form'
import { Input, Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import { required, shouldMatch, shouldNotMatch, composeValidators } from '../../../common/validators'
import { LoadingInline, FieldError } from '../../../components/common'

const PasswordChangeForm = (props) => {
  // Props and params
  const { isLoading, onSubmit, idNumber, email, intl } = props
  const { formatMessage } = intl

  return (
    <div className='password-change-form'>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, values }) => (
          <form
            onSubmit={handleSubmit}
            className='p-4'
          >
            <p className='h4 mb-4'>
              <FormattedMessage id='common_title.change_password' />
            </p>
            <Input
              id='id'
              className='form-control mb-4'
              placeholder='ID'
              value={idNumber}
              readOnly
            />
            <Input
              id='email'
              className='form-control mb-4'
              placeholder='Email'
              value={email}
              readOnly
            />
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
            <Field name='newPassword' validate={composeValidators(required, shouldNotMatch(values.password))}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    type='password'
                    className='form-control'
                    placeholder={formatMessage({ id: 'new_password' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error, formatMessage({ id: 'password' }), formatMessage({ id: 'new_password' }))} />}
                </div>
              )}
            </Field>
            <Field name='newPasswordConfirm' validate={composeValidators(required, shouldMatch(values.newPassword))}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    type='password'
                    className='form-control'
                    placeholder={formatMessage({ id: 'confirm_new_password' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error, formatMessage({ id: 'new_password' }), formatMessage({ id: 'confirm_new_password' }))} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading}>
              <FormattedMessage id='button.update_password' />
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(PasswordChangeForm)

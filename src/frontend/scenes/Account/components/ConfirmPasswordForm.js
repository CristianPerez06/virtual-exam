import React from 'react'
import { Form, Field } from 'react-final-form'
import { Input, Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import { required } from '../../../common/validators'
import { LoadingInline, FieldError } from '../../../components/common'

const ConfirmPasswordForm = (props) => {
  // Props and params
  const { isLoading, onSubmit, disabled, email, intl } = props
  const { formatMessage } = intl

  return (
    <div className='confirm-password-form'>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className='p-4'
          >
            <p className='h4 mb-4'>
              <FormattedMessage id='common_title.forgot_password' />
            </p>
            <Input
              id='email'
              className='form-control mb-4'
              placeholder='Email'
              value={email}
              readOnly
            />
            <Field name='recoveryCode' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder={formatMessage({ id: 'recovery_code' })}
                    disabled={isLoading || disabled}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Field name='newPassword' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    type='password'
                    placeholder={formatMessage({ id: 'new_password' })}
                    disabled={isLoading || disabled}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading || disabled}>
              <FormattedMessage id='button.update_password' />
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(ConfirmPasswordForm)

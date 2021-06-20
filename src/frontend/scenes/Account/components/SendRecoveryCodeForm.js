import React from 'react'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { translateFieldError } from '../../../common/translations'
import { required, emailFormat, composeValidators } from '../../../common/validators'
import { LoadingInline, FieldError } from '../../../components/common'

const SendRecoveryPasswordForm = (props) => {
  // Props and params
  const { isLoading, onSubmit, intl } = props

  return (
    <div className='send-recovery-password-form'>
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
            <Field name='email' validate={composeValidators(required, emailFormat)}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder='Email'
                    disabled={isLoading}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading}>
              <FormattedMessage id='button.send_recovery_code' />
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>
          </form>
        )}
      />
    </div>
  )
}

export default injectIntl(SendRecoveryPasswordForm)

import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Field } from 'react-final-form'
import { Button } from 'reactstrap'
import { required, shouldMatch, composeValidators, emailFormat, mustBeNumber, rangeValues } from '../../../common/validators'
import { LoadingInline, FieldError } from '../../../components/common'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ID_LENGTH } from '../../../common/constants'
import { translateFieldError } from '../../../common/translations'

const SignUpForm = (props) => {
  // Props and params
  const { isLoading, onSubmit, intl } = props
  const { formatMessage } = intl

  return (
    <div className='sign-up-form'>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit, values }) => (
          <form
            onSubmit={handleSubmit}
            className='p-4'
          >
            <p className='h4 mb-4'>
              <FormattedMessage id='common_title.register_user' />
            </p>

            <Field name='username' validate={composeValidators(required, mustBeNumber, rangeValues(ID_LENGTH.MIN, ID_LENGTH.MAX))}>
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
            <Field name='name' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder={formatMessage({ id: 'first_name' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Field name='lastname' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder={formatMessage({ id: 'last_name' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            <Field name='email' validate={composeValidators(required, emailFormat)}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder='Email'
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            {/* TO DO - Add regex validation for nickname */}
            <Field name='nickname' validate={required}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    className='form-control'
                    placeholder={formatMessage({ id: 'nick_name' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error)} />}
                </div>
              )}
            </Field>
            {/* TO DO - Add regex validation for password (use cognito format) */}
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
            <Field name='confirmPassword' validate={composeValidators(required, shouldMatch(values.password))}>
              {({ input, meta }) => (
                <div className='mb-4'>
                  <input
                    {...input}
                    type='password'
                    className='form-control'
                    placeholder={formatMessage({ id: 'confirm_password' })}
                  />
                  {meta.error && meta.touched && <FieldError error={translateFieldError(intl, meta.error, formatMessage({ id: 'password' }), formatMessage({ id: 'confirm_password' }))} />}
                </div>
              )}
            </Field>
            <Button color='primary' disabled={isLoading}>
              <FormattedMessage id='button.register' />
              {isLoading && <LoadingInline className='ml-3' />}
            </Button>
          </form>
        )}
      />
      <Link className='nav-link' to='/login'>
        <FormattedMessage id='button.go_signin_page' />
      </Link>
    </div>
  )
}

export default injectIntl(SignUpForm)

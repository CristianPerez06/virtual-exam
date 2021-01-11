import React  from 'react'
import { UncontrolledDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { useCookies } from 'react-cookie'
import { LOCALE } from '../../common/constants'
import { useHistory } from 'react-router-dom'

const LocaleSelector = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // hooks
  const [cookies, setCookie] = useCookies([])
  const history = useHistory()

  const getReadableLocale = (locale) => {
    switch (locale) {
      case LOCALE.EN:
        return formatMessage({ id: 'language.english' })
      default:
        return formatMessage({ id: 'language.spanish' })
    }
  }

  // handlers
  const changeLocale = (locale) => {
    if (locale === cookies.virtualExamLocale) return
    setCookie('virtualExamLocale', locale, { path: '/' })
    history.go(0)
  }

  return (
    <div className='locale-selector'>
      <UncontrolledDropdown>
        <DropdownToggle caret>
          {cookies.virtualExamLocale
            ? getReadableLocale(cookies.virtualExamLocale)
            : <FormattedMessage id='change_language' /> }
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => changeLocale(LOCALE.ES)}>
            <FormattedMessage id='language.spanish' />
          </DropdownItem>
          <DropdownItem onClick={() => changeLocale(LOCALE.EN)}>
            <FormattedMessage id='language.english' />
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  )
}

export default injectIntl(LocaleSelector)

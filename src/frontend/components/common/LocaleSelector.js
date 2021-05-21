import React  from 'react'
import { UncontrolledDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import Cookies from 'js-cookie'
import { LOCALE, COOKIE_NAMES } from '../../common/constants'
import { useHistory } from 'react-router-dom'

const LocaleSelector = (props) => {
  // Props and params
  const { intl } = props
  const { formatMessage } = intl

  // hooks
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
    if (locale === Cookies.get(COOKIE_NAMES.LOCALE)) return
    Cookies.set(COOKIE_NAMES.LOCALE, locale)
    history.go(0)
  }

  return (
    <div className='locale-selector'>
      <UncontrolledDropdown>
        <DropdownToggle caret>
          {Cookies.get(COOKIE_NAMES.LOCALE)
            ? getReadableLocale(Cookies.get(COOKIE_NAMES.LOCALE))
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

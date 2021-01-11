import React, { useState } from 'react'
import { useAuthContext } from '../../hooks'
import { useCookies } from 'react-cookie'
import { ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

const Header = () => {
  // state
  const [isOpen, setIsOpen] = useState(false)
  const [cookies] = useCookies()

  // hooks
  const { dispatch, cognito } = useAuthContext()

  // handlers
  const handleLogout = () => {
    cognito.logout()
    dispatch({
      type: ACCOUNT_ACTION_TYPES.LOGOUT,
      payload: { user: null, token: null }
    })
  }

  const toggle = () => setIsOpen(!isOpen)

  return (
    <Navbar className='bg-dark navbar-dark' expand='md'>
      <NavbarBrand href='/'>Virtual Exam</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className='mr-auto' navbar>
          <NavItem>
            <Link className='nav-link' to='/'>
              <FaHome style={{ fontSize: 25 + 'px' }} />
            </Link>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              <FormattedMessage id='button.courses' />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem tag={Link} to='/course/new'>
                <FormattedMessage id='button.create' />
              </DropdownItem>
              <DropdownItem tag={Link} to='/course/find'>
                <FormattedMessage id='button.find' />
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Nav className='ml-auto' navbar>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              {cookies.user}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                <FormattedMessage id='button.preferences' />
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={handleLogout}>
                <FormattedMessage id='button.logout' />
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Collapse>
    </Navbar>
  )
}

export default injectIntl(Header)

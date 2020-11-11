import React, { useState } from 'react'
import { useAuthContext } from '../../hooks'
import { Account, Cognito } from '../../utils'
import { ACCOUNT_ACTION_TYPES } from '../../common/constants'
import { Link } from 'react-router-dom'
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

const { logout } = Cognito()
const { getCurrentUser } = Account()

const Header = () => {
  // state
  const [isOpen, setIsOpen] = useState(false)

  // hooks
  const { dispatch } = useAuthContext()

  // handlers
  const handleLogout = () => {
    logout()
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
            <Link className='nav-link' to='/'>Home</Link>
          </NavItem>
          <NavItem>
            <Link className='nav-link' to='/contact'>Contact</Link>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              Options
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                Option 1
              </DropdownItem>
              <DropdownItem>
                Option 2
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem>
                Reset
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Nav className='ml-auto' navbar>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              {getCurrentUser()}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={handleLogout}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Collapse>
    </Navbar>
  )
}

export default Header

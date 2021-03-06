import React, { useState } from 'react'
import { useAuthContext } from '../../hooks'
import Cookies from 'js-cookie'
import { ACCOUNT_ACTION_TYPES, COOKIE_NAMES, ROLES } from '../../common/constants'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { FaHome, FaAlignLeft } from 'react-icons/fa'
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

  // hooks
  const { dispatch, cognito, state } = useAuthContext()

  // handlers
  const handleLogout = () => {
    cognito.logout()
    dispatch({
      type: ACCOUNT_ACTION_TYPES.LOGOUT,
      payload: { user: null, token: null }
    })
    // Full page refresh to reload MainRouter and check session
    window.location.replace('/')
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
          {state.role === ROLES.ADMIN && (
            <>
              {/* Courses */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.courses' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/courses/new'>
                    <FormattedMessage id='button.create' />
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/courses/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Units */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.units' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/units/new'>
                    <FormattedMessage id='button.create' />
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/units/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Exercises */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.exercises' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/exercises/new'>
                    <FormattedMessage id='button.create' />
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/exercises/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Templates */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.exam_templates' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/exam-templates/new'>
                    <FormattedMessage id='button.create' />
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/exam-templates/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Students */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.students' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/students/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/students/manage-exams'>
                    <FormattedMessage id='button.manage_exams' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Student Exams */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.exams' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/student-exams/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* Metrics */}
              <NavItem>
                <Link className='nav-link' to='/metrics'>
                  <FormattedMessage id='button.metrics' />
                  <FaAlignLeft className='ml-2' style={{ fontSize: 15 + 'px' }} />
                </Link>
              </NavItem>
            </>
          )}
          {state.role === ROLES.GUEST && (
            <>
              {/* Exams */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <FormattedMessage id='button.exams' />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={Link} to='/exams/list'>
                    <FormattedMessage id='button.list' />
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </>
          )}
        </Nav>
        {/* Settings */}
        <Nav className='ml-auto' navbar>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              {Cookies.get(COOKIE_NAMES.USER)}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem tag={Link} to='/settings'>
                <FormattedMessage id='button.settings' />
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

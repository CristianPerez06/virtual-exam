import React from 'react'
import { Header } from '../layout'

const Layout = (props) => {
  return (
    <div id='layout' className='h-100'>
      <Header />
      <div id='body' className='d-flex h-100 align-items-center justify-content-center'>
        {props.children}
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default Layout

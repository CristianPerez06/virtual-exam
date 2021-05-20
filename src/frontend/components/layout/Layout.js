import React from 'react'
import { Header } from '../layout'

const Layout = (props) => {
  return (
    <div id='layout' className='h-100 w-100'>
      <Header />
      <div id='body' className='d-flex pt-3 pl-3 pr-3 justify-content-center'>
        {props.children}
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default Layout

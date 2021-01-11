import React from 'react'
import { Header } from '../layout'

const Layout = (props) => {
  return (
    <div id='layout' className='h-100'>
      <Header />
      <div id='body' className='d-flex h-100 pt-3 justify-content-center ml-5 mr-5'>
        <div className='w-100'>
          {props.children}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default Layout

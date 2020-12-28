import React from 'react'
import { Header } from '../layout'

const Layout = (props) => {
  return (
    <div id='layout' className='h-100'>
      <Header />
      <div id='body'>
        {props.children}
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default Layout

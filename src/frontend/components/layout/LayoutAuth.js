import React from 'react'
import { Header } from '.'

const LayoutAuth = (props) => {
  return (
    <div id='layout-auth' className='h-100 w-100'>
      <Header />
      <div id='body' className='d-flex justify-content-center mt-4'>
        {props.children}
      </div>
      {/* <Footer /> */}
    </div>
  )
}

export default LayoutAuth

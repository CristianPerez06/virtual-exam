import React from 'react'

const LayoutUnauth = (props) => {
  return (
    <div id='layout-unauth' className='h-100 w-100' style={{ background: 'rgba(0, 0, 0, 0.76)' }}>
      <div id='body' className='d-flex pt-3 pl-3 pr-3 justify-content-center'>
        <div className='content pt-4' style={{ width: 400 + 'px' }}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

export default LayoutUnauth

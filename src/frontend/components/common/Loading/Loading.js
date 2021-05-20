import React from 'react'
import { FaSpinner } from 'react-icons/fa'
import './Loading.scss'

export const Loading = (props) => {
  const { className = '' } = props

  return (
    <div className='loader-outer'>
      <div className='loader-inner'>
        <FaSpinner style={{ color: 'grey', fontSize: '72px' }} className={`fa-pulse ${className}`} />
      </div>
    </div>
  )
}

export const LoadingInline = (props) => {
  const { className = '' } = props

  return (
    <FaSpinner style={{ color: 'white' }} className={`fa-pulse ${className}`} />
  )
}

export default Loading

import React from 'react'
import { Button } from 'reactstrap'
import { injectIntl } from 'react-intl'
import { FaRegEdit } from 'react-icons/fa'

const buttonFontSize = { fontSize: 1.2 + 'rem' }

const ExerciseDescription = (props) => {
  const { url, onChangeClicked } = props
  return (
    <div className='row text-center ml-1 mr-1'>
      <div className='col-md-10 col-xs-12 border rounded'>
        <img className='w-100' src={url} alt='' />
      </div>
      <div className='col-md-2 col-xs-12'>
        <Button
          color='outline-secondary'
          className='m-1'
          type='button'
          style={buttonFontSize}
          onClick={onChangeClicked}
        >
          <FaRegEdit />
        </Button>
      </div>
    </div>

  )
}

export default injectIntl(ExerciseDescription)

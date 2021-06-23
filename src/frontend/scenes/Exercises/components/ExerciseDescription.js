import React from 'react'
import { Button } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'

const buttonFontSize = { fontSize: 0.8 + 'rem' }

const ExerciseDescription = (props) => {
  const { url, onChangeClicked } = props
  return (
    <div className='row text-center ml-1 mr-1'>
      <div className='col-md-9 col-xs-12 border rounded'>
        <img className='w-100' src={url} alt='' />
      </div>
      <div className='col-md-3 col-xs-12'>
        <Button
          color='outline-secondary'
          className='m-1'
          type='button'
          style={buttonFontSize}
          onClick={onChangeClicked}
        >
          <FormattedMessage id='button.update_image' />
        </Button>
      </div>
    </div>

  )
}

export default injectIntl(ExerciseDescription)

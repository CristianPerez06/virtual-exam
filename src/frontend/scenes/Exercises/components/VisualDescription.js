import React from 'react'
import { Button } from 'reactstrap'
import { BlackWhiteImg } from '../../../components/common'
import { injectIntl } from 'react-intl'
import { FaRegEdit } from 'react-icons/fa'
import styled from 'styled-components'

const Styles = styled.div`
  img {
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
    width: 100%;
    height: auto;
    max-width: 400px;
  }

  .btn {
    font-size: 1.2 rem;
  }
`
const buttonStyles = { fontSize: 1.2 + 'rem' }

const VisualDescription = (props) => {
  const { url, onChangeClicked } = props
  return (
    <Styles>
      <div className='row ml-1 mr-1'>
        <div className='col-md-10 col-xs-12 border rounded'>
          <div className='image-item h-100 d-flex justify-content-center align-items-center'>
            <BlackWhiteImg url={url} />
          </div>
        </div>
        <div className='col-md-2 col-xs-12'>
          <Button
            color='outline-secondary'
            className='m-1'
            style={buttonStyles}
            type='button'
            onClick={onChangeClicked}
          >
            <FaRegEdit />
          </Button>
        </div>
      </div>
    </Styles>

  )
}

export default injectIntl(VisualDescription)

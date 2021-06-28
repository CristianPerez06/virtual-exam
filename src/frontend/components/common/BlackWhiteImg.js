import React from 'react'
import styled from 'styled-components'

const Styles = styled.div`
  img {
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
    width: 100%;
    height: auto;
    max-width: 400px;
  }
`

const BlackWhiteImg = (props) => {
  // Props and params
  const { url, alt } = props

  return (
    <Styles>
      <img src={url} alt={alt} />
    </Styles>
  )
}

export default BlackWhiteImg

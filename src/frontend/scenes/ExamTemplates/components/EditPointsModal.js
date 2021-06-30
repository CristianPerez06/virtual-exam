import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LoadingInline } from '../../../components/common'

const EditPointsModal = (props) => {
  // Props and params
  const {
    points,
    modalIsOpen,
    isBussy,
    headerTextId,
    buttonTextId,
    buttonColor,
    onCloseClick,
    onConfirmClick,
    intl
  } = props

  const { formatMessage } = intl

  // State
  const [updatedPoints, setUpdatedPoints] = useState(0)

  useEffect(() => {
    if (points) {
      setUpdatedPoints(points)
    }

    // Cleanup state on unmount
    return () => setUpdatedPoints(0)
  }, [points])

  return (
    <Modal isOpen={modalIsOpen} toggle={onCloseClick} disabled>
      <ModalHeader toggle={onCloseClick} disabled>
        <FormattedMessage id={headerTextId} />
      </ModalHeader>
      <ModalBody>
        <div className='d-flex justify-content-center'>
          <Input
            type='number'
            name='points'
            id='points'
            style={{ maxWidth: 150 + 'px' }}
            placeholder={formatMessage({ id: 'points' })}
            onChange={(e) => {
              const val = e.target.value
              setUpdatedPoints(val)
            }}
            value={updatedPoints}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color={buttonColor}
          onClick={() => {
            const val = updatedPoints
            onConfirmClick(val)
          }}
          disabled={isBussy}
        >
          <FormattedMessage id={buttonTextId} />
          {isBussy && <LoadingInline className='ml-3' />}
        </Button>
        <Button
          color='secondary'
          onClick={onCloseClick}
          disabled={isBussy}
        >
          <FormattedMessage id='button.cancel' />
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default injectIntl(EditPointsModal)

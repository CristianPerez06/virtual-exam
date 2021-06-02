import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LoadingInline } from '../../components/common'

const ModalWrapper = (props) => {
  const {
    modalIsOpen,
    isBussy,
    headerTextId,
    bodyTextId,
    buttonTextId,
    buttonColor,
    onCloseClick,
    onConfirmClick
  } = props

  return (
    <Modal isOpen={modalIsOpen} toggle={onCloseClick} disabled>
      <ModalHeader toggle={onCloseClick} disabled>
        <FormattedMessage id={headerTextId} />
      </ModalHeader>
      <ModalBody>
        <FormattedMessage id={bodyTextId} />
      </ModalBody>
      <ModalFooter>
        <Button
          color={buttonColor}
          onClick={onConfirmClick}
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

export default injectIntl(ModalWrapper)

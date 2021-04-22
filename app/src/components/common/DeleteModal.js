import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LoadingInline } from '../../components/common'

const DeleteModal = (props) => {
  const {
    modalIsOpen,
    isBussy,
    onCloseClick,
    onDeleteClick
  } = props

  return (
    <Modal isOpen={modalIsOpen} toggle={onCloseClick} disabled>
      <ModalHeader toggle={onCloseClick} disabled>
        <FormattedMessage id='common_title.delete_confirmation' />
      </ModalHeader>
      <ModalBody>
        <FormattedMessage id='delete_this_record' />
      </ModalBody>
      <ModalFooter>
        <Button
          color='danger'
          onClick={onDeleteClick}
          disabled={isBussy}
        >
          <FormattedMessage id='button.delete' />
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

export default injectIntl(DeleteModal)

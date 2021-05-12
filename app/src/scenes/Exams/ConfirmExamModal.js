import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { LoadingInline } from '../../components/common'

const ConfirmExamModal = (props) => {
  const {
    modalIsOpen,
    isBussy,
    onCloseClick,
    onConfirmClick
  } = props

  return (
    <Modal isOpen={modalIsOpen} toggle={onCloseClick} disabled>
      <ModalHeader toggle={onCloseClick} disabled>
        <FormattedMessage id='common_title.start_exam_confirmation' />
      </ModalHeader>
      <ModalBody>
        <FormattedMessage id='confirm_start_exam' />
      </ModalBody>
      <ModalFooter>
        <Button
          color='success'
          onClick={onConfirmClick}
          disabled={isBussy}
        >
          <FormattedMessage id='button.confirm_start' />
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

export default injectIntl(ConfirmExamModal)

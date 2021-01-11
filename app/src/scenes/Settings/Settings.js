import React from 'react'
import { LocaleSelector } from '../../components/common'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { injectIntl, FormattedMessage } from 'react-intl'

const Settings = (props) => {
  return (
    <div className='settings'>
      <Card className='mx-auto'>
        <CardHeader className='d-flex justify-content-between align-items-center bg-light'>
          <p className='h4'>
            <FormattedMessage id='settings' />
          </p>
        </CardHeader>
        <CardBody className='d-flex flex-column text-center'>
          <Row>
            <Col>
              <div className='mt-2'>
                <LocaleSelector />
              </div>
            </Col>
            <Col>
              Right row
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  )
}

export default injectIntl(Settings)

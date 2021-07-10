import React from 'react'
import ReactExport from 'react-export-excel'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Button } from 'reactstrap'


const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

const dataSet1 = [
  {
    name: 'Johson',
    amount: 30000,
    sex: 'M',
    is_married: true
  },
  {
    name: 'Monika',
    amount: 355000,
    sex: 'F',
    is_married: false
  },
  {
    name: 'John',
    amount: 250000,
    sex: 'M',
    is_married: false
  },
  {
    name: 'Josef',
    amount: 450500,
    sex: 'M',
    is_married: true
  }
]

const dataSet2 = [
  {
    name: 'Johnson',
    total: 25,
    remainig: 16
  },
  {
    name: 'Josef',
    total: 25,
    remainig: 7
  }
]

const buttonProps = {
  className: 'mt-4',
  disabled: false
}

const Reports = (props) => {
  // Props and params
  const { disabled = true, intl } = props

  const buttonProps = {
    className: 'mt-4',
    disabled: disabled
  }
  
  return (
    <ExcelFile
      element={
        <Button {...buttonProps}><FormattedMessage id='button.generate_report' /></Button>
      }
    >
      <ExcelSheet data={dataSet1} name='Employees'>
        <ExcelColumn label='Name' value='name'/>
        <ExcelColumn label='Wallet Money' value='amount'/>
        <ExcelColumn label='Gender' value='sex'/>
        <ExcelColumn label='Marital Status' value={(col) => col.is_married ? 'Married' : 'Single'}/>
      </ExcelSheet>
      <ExcelSheet data={dataSet2} name='Leaves'>
        <ExcelColumn label='Name' value='name'/>
        <ExcelColumn label='Total Leaves' value='total'/>
        <ExcelColumn label='Remaining Leaves' value='remaining'/>
      </ExcelSheet>
    </ExcelFile>
  )
}

export default injectIntl(Reports)
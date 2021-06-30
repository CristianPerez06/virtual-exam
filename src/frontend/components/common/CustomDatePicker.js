import React, { forwardRef } from 'react'
import { injectIntl } from 'react-intl'
import { Input } from 'reactstrap'
import { FaRegCalendarAlt } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'

const CustomDatePicker = (props) => {
  // Props and params
  const { id, selectedValue, onValueChange, position } = props

  const CustomInput = forwardRef(({ onChange, placeholder, value, id, onClick }, ref) => {
    const dateStr = format(new Date(value), 'dd/MM/yyyy')

    return (
      <div
        className='input-group'
        onClick={onClick}
        placeholder={placeholder}
        id={id}
      >
        <Input
          className='text-center'
          style={{ maxWidth: 120 + 'px' }}
          onChange={onChange}
          value={dateStr}
        />
        <span className='input-group-append ml-n1'>
          <div className='input-group-text bg-transparent'>
            <FaRegCalendarAlt />
          </div>
        </span>
      </div>
    )
  })

  return (
    <DatePicker
      id={id}
      selected={selectedValue}
      onChange={(date) => onValueChange(date)}
      popperPlacement={position}
      customInput={<CustomInput />}
    />
  )
}

export default injectIntl(CustomDatePicker)

import React, { useState, useEffect } from 'react'
import { useTimer } from 'react-timer-hook'
import addMinutes from 'date-fns/addMinutes'

const Timer = (props) => {
  const {
    startTime,
    minutesToExpire,
    onTimeExpired
  } = props

  const expiryTimestamp = addMinutes(startTime, minutesToExpire)

  const { seconds, minutes, hours, isRunning } = useTimer({
    expiryTimestamp,
    autoStart: true,
    onExpire: () => {
      setTimeExpired(true)
    }
  })

  const [timeExpired, setTimeExpired] = useState(!isRunning)

  useEffect(() => {
    if (timeExpired) {
      onTimeExpired()
    }
  }, [timeExpired, onTimeExpired])

  return (
    <div className='timer d-flex justify-content-end'>
      <div className={`border border-${timeExpired ? 'warning' : 'secondary'} shadow p-2 mb-1 bg-white rounded text-right`}>
        <span>{hours.toString().length === 1 ? `0${hours}` : hours}</span>
        :
        <span>{minutes.toString().length === 1 ? `0${minutes}` : minutes}</span>
        :
        <span>{seconds.toString().length === 1 ? `0${seconds}` : seconds}</span>
      </div>
    </div>
  )
}

export default Timer

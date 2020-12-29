import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { GET_USERS } from '../User/requests'

const User = () => {
  const { loading, data, error } = useQuery(GET_USERS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  const { getUsers = [] } = data

  return (
    <div className='User'>
      User Page
      <div>
        {getUsers.map(user => {
          return <div key={user.id}> {user.userName} </div>
        })}
      </div>
    </div>
  )
}

export default User
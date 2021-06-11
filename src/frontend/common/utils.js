import { ROLES } from './constants'

const mapStudents = (users) => {
  // Admin users should be displayed in Students list
  const filteredUsers = users.filter(user => {
    const userAttr = user.Attributes.find(x => x.Name === 'custom:role')
    return userAttr.Value === ROLES.GUEST ? user : null
  })

  const mappedStudents = filteredUsers.map((user) => {
    return {
      value: user.Username,
      label: user.Attributes.find(x => x.Name === 'name').Value + ' ' + user.Attributes.find(x => x.Name === 'family_name').Value
    }
  })
  return mappedStudents
}

export default mapStudents
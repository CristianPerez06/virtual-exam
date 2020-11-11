import React from 'react'
import { MainRouter } from './routers'
import { AuthContextProvider } from './contexts'

const App = () => {
  return (
    <AuthContextProvider>
      <div className='App w-100 h-100'>
        <MainRouter />
      </div>
    </AuthContextProvider>
  )
}

export default App

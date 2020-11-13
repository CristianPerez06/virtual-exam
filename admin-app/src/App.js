import React from 'react'
import { MainRouter } from './routers'
import { AuthContextProvider } from './contexts'
import { CookiesProvider } from 'react-cookie'

const App = () => {
  return (
    <AuthContextProvider>
      <CookiesProvider>
        <div className='App w-100 h-100'>
          <MainRouter />
        </div>
      </CookiesProvider>
    </AuthContextProvider>
  )
}

export default App

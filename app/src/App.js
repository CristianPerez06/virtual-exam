import React from 'react'
import { MainRouter } from './routers'
import { AuthContextProvider } from './contexts'
import { CookiesProvider } from 'react-cookie'

// API
import apolloClient from './api'

// Apollo
import { ApolloProvider } from 'react-apollo'

const App = () => {
  return (
    <AuthContextProvider>
      <CookiesProvider>
        <ApolloProvider client={apolloClient}>
          <div className='App w-100 h-100'>
            <MainRouter />
          </div>
        </ApolloProvider>
      </CookiesProvider>
    </AuthContextProvider>
  )
}

export default App

import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Layout } from '../components/layout'
import { IntlProvider } from 'react-intl'
import { useAuthContext } from '../hooks'

import es from '../translations/es.json'

const Main = () => {
  const { state, cognito } = useAuthContext()


  const cognitoAuthenticated = () => {
    const user = cognito.pool.getCurrentUser()
    return !!user
  }

  return (
    <IntlProvider locale="es" messages={es}>
      <Router>
        {state.isAuthenticated || cognitoAuthenticated()
          ? <Layout><AuthRouter /></Layout>
          : <UnauthRouter />}
      </Router>
    </IntlProvider>
  )
}

export default Main

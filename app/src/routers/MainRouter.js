import React, { Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthRouter, UnauthRouter } from '../routers'
import { Layout } from '../components/layout'
import { IntlProvider } from 'react-intl'
import { useAuthContext } from '../hooks'
import { useCookies } from 'react-cookie'
import { LOCALE } from '../common/constants'
import { Loading } from '../components/common'

import es from '../translations/es.json'
import en from '../translations/en.json'

const Main = () => {
  const { state, cognito } = useAuthContext()

  // hooks
  const [cookies] = useCookies([])

  const cognitoAuthenticated = () => {
    const user = cognito.pool.getCurrentUser()
    return !!user
  }

  const loc = cookies.virtualExamLocale || LOCALE.ES
  const messages = loc === LOCALE.EN ? en : es

  return (
    <Suspense fallback={<Loading />}>
      <IntlProvider locale={loc} messages={messages}>
        <Router>
          {state.isAuthenticated || cognitoAuthenticated()
            ? <Layout><AuthRouter /></Layout>
            : <UnauthRouter />}
        </Router>
      </IntlProvider>
    </Suspense>
  )
}

export default Main

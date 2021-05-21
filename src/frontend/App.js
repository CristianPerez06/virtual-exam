import React, { Suspense } from 'react'
import { MainRouter } from './routers'
import { AuthContextProvider } from './contexts'
import { IntlProvider } from 'react-intl'
import Cookies from 'js-cookie'
import { Loading } from './components/common'
import { LOCALE, COOKIE_NAMES } from './common/constants'

import es from './translations/es.json'
import en from './translations/en.json'

// API
import apolloClient from './api'

// Apollo
import { ApolloProvider } from 'react-apollo'

const App = () => {
  // Hooks
  const loc = Cookies.get(COOKIE_NAMES.LOCALE) || LOCALE.ES
  const messages = loc === LOCALE.EN ? en : es

  return (
    <AuthContextProvider>
      <ApolloProvider client={apolloClient}>
        <div className='App w-100 h-100'>
          <Suspense fallback={<Loading />}>
            <IntlProvider locale={loc} messages={messages}>
              <MainRouter />
            </IntlProvider>
          </Suspense>
        </div>
      </ApolloProvider>
    </AuthContextProvider>
  )
}

export default App

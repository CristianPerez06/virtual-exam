import React, { Suspense } from 'react'
import { MainRouter } from './routers'
import { AuthContextProvider } from './contexts'
import { CookiesProvider, useCookies } from 'react-cookie'
import { IntlProvider } from 'react-intl'
import { Loading } from './components/common'
import { LOCALE } from './common/constants'

import es from './translations/es.json'
import en from './translations/en.json'

// API
import apolloClient from './api'

// Apollo
import { ApolloProvider } from 'react-apollo'

const App = () => {
  // Hooks
  const [cookies] = useCookies([])

  const loc = cookies.virtualExamLocale || LOCALE.ES
  const messages = loc === LOCALE.EN ? en : es

  return (
    <AuthContextProvider>
      <CookiesProvider>
        <ApolloProvider client={apolloClient}>
          <div className='App w-100 h-100'>
            <Suspense fallback={<Loading />}>
              <IntlProvider locale={loc} messages={messages}>
                <MainRouter />
              </IntlProvider>
            </Suspense>
          </div>
        </ApolloProvider>
      </CookiesProvider>
    </AuthContextProvider>
  )
}

export default App

import { Box, ChakraProvider, Flex, Spinner } from '@chakra-ui/react'
import "@fontsource/jetbrains-mono"
import Compiler from '@core/system/compiler'
import useGPU from '@core/hooks/singleton/useGPU'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { RecoilRoot } from 'recoil'
import theme from '@theme/theme'
import '../styles/create.css'
import '../styles/globals.css'
import '../styles/index.css'
import '../styles/actionbar.css'
import { Provider } from 'next-auth/client'


const GPUController = () => {
  useGPU()
  return <></>
}

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const handleStart = () => {
      setLoading(true)
    }

    const handleComplete = () => {
      setLoading(false)
    }

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router])

  useEffect(() => {
    Compiler.instance()
  }, [])

  return (
    <>
      <Head>
        <meta httpEquiv="origin-trial" content={process.env.ORIGIN_KEY} />
      </Head>
      <Provider session={pageProps.session}>
        <RecoilRoot>
          <ChakraProvider theme={theme}>
            {
              loading &&
              <Flex
                position="absolute"
                transform="translate(-50%, -50%)"
                left="50%"
                top="0%"
                zIndex={20}
                gridGap="1rem"
              >
                <Box width="100vw" height="0.5rem" className="loading-gradient" />
              </Flex>
            }
            <GPUController />
            <Component {...pageProps} />
          </ChakraProvider>
        </RecoilRoot>
      </Provider>
    </>
  )
}
export default MyApp

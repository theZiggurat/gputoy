import { ChakraProvider, Flex, Spinner } from '@chakra-ui/react'
import "@fontsource/jetbrains-mono"
import Compiler from '@gpu/compiler'
import useGPU from '@recoil/hooks/useGPU'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { RecoilRoot } from 'recoil'
import theme from '../src/theme/theme'
import '../styles/create.css'
import '../styles/globals.css'
import '../styles/index.css'
import '../styles/actionbar.css'


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
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          {loading &&
            <Flex
              position="absolute"
              transform="translate(-50%, -50%)"
              left="50%"
              top="50%"
              zIndex={20}
              p="1rem"
              alignItems="center"
              gridGap="1rem"
            >
              <Spinner />
            </Flex>
          }
          <GPUController />
          <Component {...pageProps} />
        </ChakraProvider>
      </RecoilRoot>
    </>
  )
}
export default MyApp

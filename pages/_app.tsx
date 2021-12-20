import { ChakraProvider, Flex, Spinner, Text } from '@chakra-ui/react'
import "@fontsource/jetbrains-mono"
import Compiler from '@gpu/compiler'
import useGPU from '@recoil/hooks/useGPU'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import 'react-tabs/style/react-tabs.css'
import { RecoilRoot } from 'recoil'
import consts from '../src/theme/consts'
import theme from '../src/theme/theme'
import '../styles/create.css'
import '../styles/globals.css'
import '../styles/index.css'

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
              bg='blackAlpha.800'
              p="1rem"
              border="1px"
              borderColor="whiteAlpha.600"
              borderRadius="md"
              alignItems="center"
              gridGap="1rem"
            >
              <Text fontSize="1.5rem" fontFamily={consts.fontMono}>
                Loading...
              </Text>
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

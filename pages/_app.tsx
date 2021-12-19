import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider, useColorModeValue, Flex, Spinner, Text } from '@chakra-ui/react'
import GPU from '../src/gpu/gpu'

import { RecoilRoot } from 'recoil'

import '../styles/globals.css'
import '../styles/create.css'
//import '../styles/prism-custom.css'
//import '../styles/prism-custom-light.css'
import '../styles/index.css'
import 'react-tabs/style/react-tabs.css';

import "@fontsource/jetbrains-mono"
import Compiler from '../src/gpu/compiler'
import theme, { themed } from '../src/theme/theme'
import Head from 'next/head'
import { useRouter } from 'next/router'
import consts from '../src/theme/consts'
import GPUController from '../src/components/gpuController'

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const handleStart = () => {
      console.log('routeChangeStart')
      setLoading(true)
    }
    
    const handleComplete = () => {
      console.log('routeChangeComplete')
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
        <meta http-equiv="origin-trial" content={process.env.ORIGIN_KEY}/>
      </Head>
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          { loading && 
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
              <Spinner/>
            </Flex>
          } 
          <GPUController/>
          <Component {...pageProps}/>
        </ChakraProvider>
      </RecoilRoot>
    </>
  )
}
export default MyApp

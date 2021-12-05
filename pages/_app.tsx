import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider, useColorModeValue } from '@chakra-ui/react'

import { RecoilRoot } from 'recoil'

import '../styles/globals.css'
import '../styles/create.css'
import '../styles/prism-custom.css'
import '../styles/prism-custom-light.css'
import '../styles/index.css'
import 'react-tabs/style/react-tabs.css';

import "@fontsource/jetbrains-mono"
import Compiler from '../src/gpu/compiler'
import theme from '../src/theme/theme'

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    Compiler.instance()
  }, [])

  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Component {...pageProps}/>
      </ChakraProvider>
    </RecoilRoot>
  )
}
export default MyApp

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, Box, useColorModeValue} from '@chakra-ui/react'
import React from 'react'
import '../styles/create.css'
import '../styles/prism-custom.css'
import 'react-tabs/style/react-tabs.css';


function MyApp({ Component, pageProps }: AppProps) {

  return (
    <ChakraProvider>
      <Component {...pageProps} />
  </ChakraProvider>
  )
}
export default MyApp

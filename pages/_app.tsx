import React from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

import { RecoilRoot } from 'recoil'

import '../styles/globals.css'
import '../styles/create.css'
import '../styles/prism-custom.css'
import '../styles/index.css'
import 'react-tabs/style/react-tabs.css';
import ProjectManager from '../src/components/projectManager'

import "@fontsource/jetbrains-mono"


const theme = extendTheme({
  initialColorMode: 'dark', 
  useSystemColorMode: false,
  colors: {
    gray: {
      150: '#E8EDF4',
      800: '#19191D',
      850: '#17171A',
      900: '#151517',
      1000: '#050505'
    },
  },
  fonts: {
    heading: 'JetBrains Mono',
  }
})

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <RecoilRoot>
      <ProjectManager/>
      <ChakraProvider theme={theme}>
        <Component {...pageProps}/>
      </ChakraProvider>
    </RecoilRoot>
  )
}
export default MyApp

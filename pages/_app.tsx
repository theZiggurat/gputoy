import React from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

import { RecoilRoot } from 'recoil'

import { GPUInitResult } from '../src/gpu/gpu'
import ShdrAlert from '../src/components/warning'

import '../styles/globals.css'
import '../styles/create.css'
import '../styles/prism-custom.css'
import 'react-tabs/style/react-tabs.css';
import dynamic from 'next/dynamic'


const theme = extendTheme({
  
  colors: {
    gray: {
      150: '#E8EDF4',
      850: '#191D28'
    },
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  const [gpuInitResult, setGPUInitResult] = React.useState('ok' as GPUInitResult)

  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <ShdrAlert gpuResult={gpuInitResult}/>
        <Component {...pageProps} />
      </ChakraProvider>
    </RecoilRoot>
  )
}
export default MyApp

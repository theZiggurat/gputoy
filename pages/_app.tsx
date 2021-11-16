import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

import GPU, { GPUInitResult } from '../src/gpu/gpu'
import ShdrAlert from '../src/components/warning'

import '../styles/globals.css'
import '../styles/create.css'
import '../styles/prism-custom.css'
import 'react-tabs/style/react-tabs.css';

//const NagaShader = dynamic(() => import('../naga-compiler/pkg/naga_compiler'))

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

  // useEffect(() => {
  //   const initGPU = async () =>  setGPUInitResult(await GPU.init())
  //   initGPU()
  // }, [])

  return (
    <ChakraProvider theme={theme}>
      <ShdrAlert gpuResult={gpuInitResult}/>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
export default MyApp

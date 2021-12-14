import React from 'react'
import SplitPane from 'react-split-pane'
import Scaffold from "../src/components/scaffold"
import {
  Box
} from '@chakra-ui/react'
import Head from 'next/head'
import descriptors from '../src/components/panels/descriptors'
import { usePanels, Panels } from '../src/components/panels/panel'
import ProjectManager from '../src/components/create/projectManager'


const Inner = () => {
  const props = usePanels()
    
  return (
    <>
      <ProjectManager/>
      <Panels {...props} descriptors={descriptors}/>
    </>
  )
}

const Documentation = () => {
  return (
    <Scaffold>
      <Head>
        <title>{`GPUToy :: Unnamed Project`}</title>
      </Head>
      <SplitPane 
        style= {{
          flex: '1 1 auto',
          position: 'relative',
          maxHeight: '100%',
          minHeight: '0%'
        }}
      >
        <Box width="100%" height="100%">
          Test
        </Box>
        <Inner/>
      </SplitPane>
    </Scaffold>
  )
}

export default Documentation
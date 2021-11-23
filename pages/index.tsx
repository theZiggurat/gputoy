import type { NextPage } from 'next'
import { ReactNode } from 'react'
import { 
  chakra, 
  Box, 
  useColorModeValue,
} from '@chakra-ui/react'

import Scaffold from '../src/components/scaffold'



const Home: NextPage = () => {


  return (
    <Scaffold>
      <chakra.div flex="1 1 auto" justifyContent="center" textAlign="center" height="100%">
        This is a welcome experience!
      </chakra.div>
    </Scaffold>
  )
}

export default Home

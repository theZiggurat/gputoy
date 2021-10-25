import React from 'react'
import Scaffold from '../src/components/scaffold'
import { chakra, Text, HStack } from '@chakra-ui/react'
import {BsSearch} from 'react-icons/bs'

const NotFoundPage = () => {
  return (
    <Scaffold>
      <chakra.div height="100%" flexDirection="column" alignItems="center" textAlign="center" display="flex" justifyContent="center">
      <Text fontWeight="normal" fontSize={35}>Nothing to see here...</Text> 
          <HStack>
            <BsSearch size={20}/>
            <Text fontWeight="light" fontSize={20}>404: Page not found</Text>
          </HStack>
      </chakra.div>
    </Scaffold>
  )
}

export default NotFoundPage
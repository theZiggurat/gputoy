import { chakra, Flex, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import { BsSearch } from 'react-icons/bs'
import Scaffold from '@components/shared/scaffold'
import { themed, themedRaw } from '@theme/theme'
import Footer from '@components/index/footer'

const NotFoundPage = () => {
  return (
    <Scaffold>
      <Flex width="100vw" height="100%" flexDirection="column" display="flex" justifyContent="center" bg={themed('bg')}>
        <Flex flexDir="column" flex="1 1 auto" alignItems="center" justifyContent="center">
          <Text fontWeight="bold" fontSize={50} >Nothing to see here...</Text>
          <HStack>
            <BsSearch size={14} fill={themedRaw("textMidLight")} />
            <Text fontWeight="normal" fontSize={20} color={themed("textMidLight")}>404: Page not found</Text>
          </HStack>
        </Flex>

        <Footer />
      </Flex>
    </Scaffold>
  )
}

export default NotFoundPage
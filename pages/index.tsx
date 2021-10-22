import type { NextPage } from 'next'
import { ReactNode } from 'react'
import { 
  chakra, 
  Box, 
  useColorModeValue,
} from '@chakra-ui/react'

import Scaffold from '../src/components/scaffold';

const WelcomeDescription = (props: {title: String, bolded: String | null, desc: String}) => (
  <Box bgColor={useColorModeValue("rgba(247, 247, 248, 0.5)", "rgba(26, 32, 44, 0.5)")} 
    rounded="lg" minH="10rem" shadow="md">
    <chakra.h1 m={4} fontWeight="bold" fontSize="20">
      {props.title} <chakra.span fontWeight="extrabold">{props.bolded}</chakra.span>
    </chakra.h1>
      
    <chakra.p m={4} maxWidth={500} fontFamily="sans-serif">
      {props.desc}
    </chakra.p>
  </Box>
);

const Home: NextPage = () => {
  return (
    <Scaffold>
      <chakra.div flex="1 1 auto">
        Home
      </chakra.div>
    </Scaffold>
  )
}

export default Home

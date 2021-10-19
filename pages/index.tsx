import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Nav from './components/navbar'

import { ReactNode } from 'react'
import { 
  ChakraProvider, 
  chakra, 
  Box, 
  Flex, 
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  HStack,
  Center,
} from '@chakra-ui/react'
import Canvas from './components/canvas'

const Code = ({children}: {children: ReactNode}) => (
  <chakra.code bg={useColorModeValue('gray.200', 'gray.700')}>
    {children}
  </chakra.code>
);

const FluiAlert = () => (
  <Alert status="error" height="3rem" backgroundColor="red.900">
    <AlertIcon color="red.400"/>
    <AlertTitle mr={2}>Your browser is outdated!</AlertTitle>
    <AlertDescription>
      &nbsp;WebGPU is required to use Flui.
      Click&nbsp;
      <chakra.a href="https://caniuse.com/webgpu" fontWeight="bold">here</chakra.a> 
      &nbsp;to learn more about browser compatability.
    </AlertDescription>
  </Alert>
);

const WelcomeDescription = (props: {title: String, bolded: String | null, desc: String}) => (
  <Box bgColor={useColorModeValue('gray.100', 'gray.900')} rounded="lg" minH="13rem">
    <chakra.h1 m={8} fontWeight="bold" fontSize="20">
      {props.title} <chakra.span fontWeight="extrabold">{props.bolded}</chakra.span>
    </chakra.h1>
      
    <chakra.p m={8} maxWidth={500} fontFamily="sans-serif">
      {props.desc}
    </chakra.p>
  </Box>
);

const Home: NextPage = () => {
  let gpu = true;
  if (typeof window !== "undefined") {
    gpu = window.navigator.gpu;
  }
  
  return (
    <ChakraProvider>
      <Head>
        <title>Flui Home</title>
        <meta name="description" content="Create your imagination" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        !gpu && <FluiAlert/>
      }
      
      <main>
        <Nav/>
        <HStack m={5} alignItems='center'>
          <WelcomeDescription
            title="Cutting edge "
            bolded="Power"
            desc="Flui utilizes WebGPU, which allow you to utilize the same capabilites of desktop graphics applications.
            This includes compute shaders, offscreen rendering, back buffers, raytracing, and more!"
          />

          <WelcomeDescription
            title="Share with "
            bolded="Everyone"
            desc="Any creation you make in Flui can be viewed, forked, or even embedded with the click
            of a link. "
          />
        </HStack>
        {
          gpu && <Canvas/>
        }
      </main>
    </ChakraProvider>
  )
}

export default Home

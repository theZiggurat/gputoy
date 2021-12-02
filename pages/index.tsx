import type { NextPage } from 'next'
import { ReactNode, useEffect, useState } from 'react'
import { 
  Box, 
  useColorModeValue,
  Heading,
  Flex,
  Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import {BiBrain, BiGitRepoForked} from 'react-icons/bi'
import {GrAction} from 'react-icons/gr'
import {MdOutlineConnectWithoutContact, MdCable} from 'react-icons/md'

import Scaffold from '../src/components/scaffold'
import "@fontsource/jetbrains-mono"


const Card = (props: {head: string, icon: ReactNode,children: string}) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      backgroundColor={useColorModeValue("blackAlpha.200", 'gray.900')} 
      width="50rem"
      m="1rem"
      borderRadius="1rem"
      transition="box-shadow 500ms ease"
      zIndex={1}
      _hover={{
        shadow: '0px 0px 10px 10px rgba(30, 30, 255, 0.1)'
      }}
    >
      <Heading fontSize={35} fontWeight="extrabold" textAlign='left' p='2.2rem' width="18rem">
        {props.head}
      </Heading>
      <Box bg={useColorModeValue("#EBEBEB", 'gray.1000')} height="100%" width="1rem" position="relative">
        <Box 
          bg={useColorModeValue("#EBEBEB", 'gray.1000')} 
          width="fit-content" height="fit-content" 
          borderRadius="40%" p={4} 
          position="absolute" 
          top="50%"
          left="50%" 
          transform='translate(-50%, -50%)'
        >
          {props.icon}
        </Box>
      </Box>
      <Text fontSize={15} fontFamily="'JetBrains Mono'" width="25rem" p="2rem">
        {props.children}
      </Text>
    </Flex>
  )
}

const Home: NextPage = () => {

  const [headerIndex, setHeaderIndex] = useState(0)

  const onTimer = () => setHeaderIndex(headerIndex+1)

  useEffect(() => {
    const interval = setInterval(onTimer, 200)
    return () => clearInterval(interval)
  })


  return (
    <Scaffold>
      <Head>
        <title>GPUToy</title>
      </Head>
      <Flex width="100%" height="100%" bg="gray.1000">
        <Box className="bg" zIndex="0"/>
        <Flex direction="column" alignItems="center"  width="fit-content" bg={useColorModeValue("blackAlpha.200", 'gray.1000')}  h='100%' pt="5rem" p="5rem">
          <Heading m="3rem" _after={{
            content: '" "',
            backgroundColor: "gray.200",
            width: "1rem",
            height:"2rem",
            position: 'absolute'
          }}>
            {'GPUToy is...'.substring(0, headerIndex)}
          </Heading>
          <Card head="Capable" icon={<BiBrain size='4rem'/>}>
            WebGPU exposes the same graphics capabilities as desktop graphics APIs like Vulkan, DirectX, and Metal.
          </Card>
          <Card head="Connected" icon={<MdOutlineConnectWithoutContact size='4rem'/>}>
            Share your creations. Browse for inspiration. Fork to learn about others creations.
          </Card>
          <Card head="Extendable" icon={<MdCable size='4rem'/>}>
            Use the content browser (WIP) to utilize sub-shaders and shader functions in your project.
          </Card>
          <Card head="Elegant" icon={<BiBrain size='4rem'/>}>
            A shader prototyping tool for the future. GPUToy's interface takes inspiration from Blender.
          </Card>
        </Flex>
      </Flex>
    </Scaffold>
  )
}

export default Home

import type { NextPage } from 'next'
import React, { ReactChild, ReactNode, useEffect, useState } from 'react'
import { 
  chakra,
  Image,
  Box, 
  useColorModeValue,
  Heading,
  Flex,
  Text,
  Button,
  useColorModePreference,
  Stack,
  Divider,
} from '@chakra-ui/react'
import Head from 'next/head'
import {BiBrain, BiGitRepoForked} from 'react-icons/bi'
import {GrAction} from 'react-icons/gr'
import {MdOutlineConnectWithoutContact, MdCable} from 'react-icons/md'

import Scaffold from '../src/components/scaffold'
import "@fontsource/jetbrains-mono"
import ProjectCard from '../src/components/reusable/projectCard'
import prisma from '../lib/prisma'
import { useProjectDirect } from '../src/gpu/projectDirect'
import EditorDemo from '../src/components/index/editorDemo'
import Typer from '../src/components/reusable/typer'


export const getStaticProps = async (context) => {
  const projects = await prisma.project.findMany({
    take: 1,
    include: {
        shaders: true,
        author: {
            select: {
                name: true
            }
        }
    }
  })
  projects.forEach(p => {
    p.createdAt = p.createdAt.toISOString()
    p.updatedAt = p.updatedAt.toISOString()
  })
  return {
    props: {
      project: projects[0]
    },
  };
}

const CodeSpan = (props: {text: string}) => (
  <chakra.span 
    fontFamily="'JetBrains Mono'" 
    color={useColorModeValue("whiteAlpha.800", 'black')} 
    bg={useColorModeValue("blackAlpha.700", "whiteAlpha.700")} 
    px="0.2rem" 
    fontSize="0.9em"
  >
    {props.text}
  </chakra.span>
)


const Card = (props: {head: string, icon: ReactNode,children: string}) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      backgroundColor={useColorModeValue("light.input", 'dark.divider')} 
      backdropFilter="blur(20px)"
      width="100%"
      m="1rem"
      px="5rem"
      transition="box-shadow 500ms ease"
      zIndex={1}
      mixBlendMode="hard-light"
      _hover={{
        shadow: '0px 0px 10px 10px rgba(30, 30, 255, 0.1)'
      }}
    >
      <Box flex="1" alignItems="end">
        <Heading fontSize={35} fontWeight="extrabold" textAlign='left' width="25rem">
          {props.head}
        </Heading>
      </Box>
      <Box>
        {props.icon}
      </Box>
      <Text fontSize={15} fontFamily="'JetBrains Mono'" width="25rem" flex="1">
        {props.children}
      </Text>
    </Flex>
  )
}

const Home: NextPage = (props) => {

  const [tran, setTran] = useState(false)
  const [ptr1, setPtr1] = useState(1)

  const [headerIndex, setHeaderIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  //const x = useProjectDirect(props.project, false, 'bg')

  useEffect(() => {setTimeout(() => setTran(true), 5)}, [])

  return (
    <Scaffold>
      <Head>
        <title>GPUToy</title>
      </Head>
      {/* <canvas id='bg' style={{
          position: "fixed",
          minHeight: "50%",
          width: '100%',
          height: '100%',
          transition: 'opacity 1s ease, transform 0.1s ease',
          filter: "blur(0px)"
        }}/> */}
      <Flex width="100%" height="100%" position="relative" overflowY="scroll" overflowX="hidden" direction="column" flex="1 1 auto">
        <Flex flex="1" w="100vw" bg={useColorModeValue('light.p', 'dark.p')} direction="column" textAlign="center">



          <Flex height="100%" direction="column" justifyContent="center" alignItems="center" textAlign="center" mt="10vh" mb="10vh" flexWrap="wrap">
            <Stack m="1rem">
              <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
                Convey your imagination <br/>
                <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                  <Typer text="...(in code)"/>
                </chakra.span>
              </Heading>
              <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
                A shader is a visual expression of mathematical beauty.
              </Text>
              <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
                Unlike a video, it is handcrafted. One pixel at a time.
              </Text>
            </Stack>
            <Box 
              position="relative"
              bg={useColorModeValue('light.a2', 'dark.a2')}
              pt="1rem"
              m="1rem"
              minW="550px" 
              minH="473px"
              zIndex={2}
              _before={{
                content: "''",
                position: 'absolute',
                width: '550px',
                height: '473px',
                left: tran ? '20px':'0px',
                top: tran ? '20px':'0px',
                backgroundColor: useColorModeValue('light.a1', 'dark.a1'),
                transition: 'left 0.5s ease-out, top 0.5s ease-out',
                shadow: "lg",
                zIndex: -1
              }}
              _after={{
                content: "''",
                position: 'absolute',
                width: '550px',
                height: '473px',
                left: tran ? '10px':'0px',
                top: tran ? '10px':'0px',
                backgroundColor: 'red.500',
                zIndex: -2,
                transition: 'left 0.4s ease-out, top 0.4s ease-out',
                shadow: "x-lg",
              }}
            >
              <EditorDemo/>
            </Box>
          </Flex>

          <Flex height="100%" direction="column" alignItems="center" textAlign="center" mt="10vh" mb="10vh">
            <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
              Collaborate and Get Inspired <br/>
              <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                <Typer text="...(or envious)"/>
              </chakra.span>
            </Heading>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
              Browse thousands of projects instantly.
            </Text>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
              Has a project impressed you? Inspect it in the editor.
            </Text>
            <Button mt="5rem" size="lg" bg="red.600">
              Take a look
            </Button>
          </Flex>

          <Flex height="100%" direction="column" alignItems="center" textAlign="center" mt="10vh" mb="10vh">
            <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
              Built different <br/>
              <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                <Typer text="...(yet familiar)"/>
              </chakra.span>
            </Heading>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
              Made from the ground up for WebGPU, the new graphics standard for the web.
            </Text>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
              Try wgsl, the official shading language of WebGPU, or stick to glsl.
            </Text>
            
            <Flex pt="2rem" direction="row" justifyContent="center">
              <Image src={useColorModeValue("/wgpuLogo.svg", "/wgpuLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)"/>
              <Image src={useColorModeValue("/wgslLogo.svg", "/wgslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)"/>
              <Image src={useColorModeValue("/glslLogo.svg", "/glslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)"/>
            </Flex>
            <Button mt="5rem" size="lg" bg="red.600">
              Start shading for free
            </Button>
          </Flex>
          
        </Flex>
      </Flex>
    </Scaffold>
  )
}

export default Home

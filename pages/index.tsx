import {
  Box, Button, chakra, Divider, Flex, Heading, HStack, Image, Stack, Text, useColorModeValue
} from '@chakra-ui/react'
import "@fontsource/jetbrains-mono"
import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { AiFillGithub, AiFillRedditCircle, AiFillTwitterCircle } from 'react-icons/ai'
import { BiPaint } from 'react-icons/bi'
import { BsClipboardData } from 'react-icons/bs'
import prisma from '../lib/prisma'
import EditorDemo from '../src/components/index/editorDemo'
import Typer from '../src/components/shared/misc/typer'
import Scaffold from '../src/components/shared/scaffold'
import { darkEditor, lightEditor } from '../src/theme/consts'

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

const Home: NextPage = (props) => {

  const [tran, setTran] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  const handleScroll = (ev) => {
    setScrollPosition(ev.target.scrollTop)
  };

  useEffect(() => {
  }, [scrollPosition])


  useEffect(() => { setTimeout(() => setTran(true), 500) }, [])

  return (
    <Scaffold>
      <Head>
        <title>GPUToy</title>
      </Head>
      <Flex width="100%" height="100%" position="relative" overflowY="scroll" overflowX="hidden" direction="column" flex="1 1 auto" onScroll={handleScroll}>
        <Flex flex="1" w="100vw" bg={useColorModeValue('light.p', 'dark.p')} direction="column" textAlign="center">
          <Flex
            height="100%"
            direction="column"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            position="relative"
            mt="10vh"
            mb="10vh"
            opacity={tran ? 1 : 0}
            transition="opacity 1.5s ease-out"
          >
            <Box
              position="absolute"
              minH="40%"
              minW="100vw"
              top="50%"
              bg="red.500"
              clipPath={tran ? "polygon(0 10%, 100% 0, 100% 90%, 0% 100%)" : "polygon(0 0%, 100% 0, 100% 100%, 0% 100%)"}
              bgGradient="linear(to-r, red.400, orange.400)"
              transition="all 2s ease"
            />
            <Stack m="1rem">
              <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
                Convey your imagination <br />
                <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                  <Typer text="...(in code)" />
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
              sx={useColorModeValue(lightEditor, darkEditor)}
              _before={{
                content: "''",
                position: 'absolute',
                width: '550px',
                height: '473px',
                left: tran ? '20px' : '0px',
                top: tran ? '20px' : '0px',
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
                left: tran ? '10px' : '0px',
                top: tran ? '10px' : '0px',
                backgroundColor: 'red.500',
                zIndex: -2,
                transition: 'left 0.4s ease-out, top 0.4s ease-out',
                shadow: "x-lg",
              }}
            >
              <EditorDemo />
            </Box>
          </Flex>

          <Flex height="100%" direction="column" alignItems="center" textAlign="center" mt="10vh" mb="10vh">
            <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
              Collaborate and Get Inspired <br />
              <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                <Typer text="...(or envious)" />
              </chakra.span>
            </Heading>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
              Browse thousands of projects instantly.
            </Text>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
              Has a project impressed you? Inspect it in the editor.
            </Text>
          </Flex>

          <Flex height="100%" direction="column" alignItems="center" textAlign="center" mt="10vh" mb="10vh">
            <Heading fontFamily="'Segoe UI'" fontSize="3.8rem" pb="2rem" fontWeight="black">
              Built different <br />
              <chakra.span fontFamily="'JetBrains Mono'" fontSize="3rem" ml="2rem" color="red.500">
                <Typer text="...(yet familiar)" />
              </chakra.span>
            </Heading>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
              Made from the ground up for WebGPU, the new graphics standard for the web.
            </Text>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
              Try wgsl, the official shading language of WebGPU, or stick to glsl.
            </Text>

            <Flex pt="2rem" direction="row" justifyContent="center">
              <Image src={useColorModeValue("/wgpuLogo.svg", "/wgpuLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="WebGPU" />
              <Image src={useColorModeValue("/wgslLogo.svg", "/wgslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="WGSL" />
              <Image src={useColorModeValue("/glslLogo.svg", "/glslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="GLSL" />
            </Flex>

          </Flex>
          <Flex bgGradient="linear(to-r, red.400, orange.400)" alignItems="center" justifyContent="center" p="5rem" gridGap="1rem">
            <Button size="lg" bg={useColorModeValue('light.p', 'dark.p')} rightIcon={<BiPaint />}>
              Start Shading
            </Button>
            <Button size="lg" bg={useColorModeValue('light.p', 'dark.p')} rightIcon={<BsClipboardData />}>
              Sign Up for Free
            </Button>
          </Flex>

          <Flex flexDir="row" justifyContent="center" py="5rem" gridGap="10vw" flexWrap="wrap">
            <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
              <Text fontSize="2rem" fontWeight="extrabold" cursor="pointer" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")} lineHeight="2rem">
                GPUTOY
              </Text>
              <Flex gridGap="0.5rem" pt="1rem">
                <AiFillTwitterCircle size={30} />
                <AiFillRedditCircle size={30} />
                <AiFillGithub size={30} />
              </Flex>
            </Flex>
            <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
              <Text fontSize="1.2rem" pb="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")} fontWeight="bold">
                Resources
              </Text>
              <Text fontSize="1rem">
                Tutorial
              </Text>
              <Text fontSize="1rem">
                Documentation
              </Text>
            </Flex>
            <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
              <Text fontSize="1.2rem" pb="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")} fontWeight="bold">
                About
              </Text>
              <Text fontSize="1rem">
                About us
              </Text>
              <Text fontSize="1rem">
                Roadmap
              </Text>
            </Flex>
            <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
              <Text fontSize="1.2rem" pb="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")} fontWeight="bold">
                Contact
              </Text>
              <Text fontSize="1rem">
                Email us
              </Text>
              <Text fontSize="1rem">
                Submit an issue
              </Text>
            </Flex>

          </Flex>
          <Divider borderColor={useColorModeValue("blackAlpha.300", "whiteAlpha.500")} />
          <HStack gridGap="10rem" margin="auto">
            <Text fontSize="0.8rem" py="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}>
              Privacy Policy
            </Text>
            <Text fontSize="0.8rem" py="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}>
              Terms of Service
            </Text>
          </HStack>
        </Flex>
      </Flex>
    </Scaffold>
  )
}

export default Home

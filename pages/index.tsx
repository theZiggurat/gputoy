import {
  Box,
  Button, chakra, Flex, FlexProps, Heading, HeadingProps, Image, Link, Stack, Text, TextProps, useColorModeValue
} from '@chakra-ui/react'
import Footer from '@components/index/footer'
import { CreatePageProjectQueryWithId, createPageProjectQueryWithId } from 'core/types/queries'
import prisma from 'core/backend/prisma'
import "@fontsource/jetbrains-mono"
import Head from 'next/head'
import React, { ReactNode, useEffect, useState } from 'react'
import { BiPaint } from 'react-icons/bi'
import { BsClipboardData } from 'react-icons/bs'
import { themed } from 'theme/theme'
import Scaffold from '@components/shared/scaffold'
import { MdCode } from 'react-icons/md'
import { IoCode, IoWarning } from 'react-icons/io5'
import { FaGithub } from 'react-icons/fa'
import { WarningIcon } from '@chakra-ui/icons'
import useGPU from '@core/hooks/useGPU'
import { gpuStatusAtom } from '@core/recoil/atoms/gpu'
import { useRecoilValue } from 'recoil'

const Section = (props: FlexProps) => (
  <Flex flexDir="column" minH="100vh" alignItems="center" {...props}>
    {props.children}
  </Flex>
)

const MainHeading = (props: { children: ReactNode, redText: string, fontSize?: string } & HeadingProps) => {
  const { children, redText, fontSize, ...hProps } = props
  return <Heading fontFamily="'Segoe UI'" fontSize={fontSize ?? ["2rem", "2.5rem", "2.5rem", "3rem"]} fontWeight="black" {...hProps}>
    {props.children}
    <chakra.span color="red.500" whiteSpace="nowrap" fontWeight="black">
      &nbsp;{props.redText}
    </chakra.span>
  </Heading>
}

const MainDesc = (props: { children: ReactNode } & TextProps) => {
  const { children, ...tProps } = props
  return <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize={["1rem", "1rem", "1.1rem", "1.2rem"]} {...tProps} color={themed("textMid")}>
    {children}
  </Text>
}

const SubDesc = (props: { children: ReactNode }) => (
  <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
    {props.children}
  </Text>
)

const IncompatibilityError = () => (
  <a href="https://caniuse.com/webgpu" target="_blank" rel="noreferrer">
    <Flex mt="2rem" bg="red.500" p="1rem" borderRadius="1rem" justifyContent="space-between" alignItems="center">
      <IoWarning size="3rem" />
      <Box flex="1 1 auto">
        <Text fontSize="1.2rem" fontWeight="bold">
          Unfortunately, your browser is not compatible with GPUToy.
        </Text>
        <Text fontSize="1rem" color={themed('textMid')}>
          Click here to view compatible browser versions.
        </Text>
      </Box>
    </Flex>
  </a>
)

const DetailCard = (props: { children: ReactNode }) => (
  <Flex
    w="100%"
    flexDir="row"
    justifyContent="space-between"
    alignItems="center"
    p={["1rem", "1.3rem", "1.5rem", "2rem"]}
    boxShadow="sm"
    transition="box-shadow 0.3s ease"
    _hover={{
      boxShadow: "md"
    }}
    borderY="1px"
    borderColor={themed('borderLight')}
  >
    {props.children}
  </Flex>
)

type HomePageProps = {
  projectOfTheDay: CreatePageProjectQueryWithId
}

export async function getStaticProps() {
  const projectOfTheDay = await prisma.project.findUnique({
    ...createPageProjectQueryWithId,
    where: {
      id: 'ckynp0plu0857k0unb4njen1a'
    }
  })

  return {
    props: {
      projectOfTheDay
    }
  }
}


const Home = (props: HomePageProps) => {

  const { projectOfTheDay } = props

  const [tran, setTran] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const gpuStatus = useRecoilValue(gpuStatusAtom)

  const handleScroll = (ev) => {
    setScrollPosition(ev.target.scrollTop)
  };

  useEffect(() => {
  }, [scrollPosition])


  useEffect(() => { setTimeout(() => setTran(true), 500) }, [])

  const sectionPad = ["2rem", "2.5rem", "3rem", "5rem"]

  return (
    <Scaffold>
      <Head>
        <title>GPUToy</title>
        <meta property="og:title" content="gputoy home" key="ogtitle" />
        <meta property="og:description" content="Create and share stunning shaders. Sign up for free using github." key="ogdesc" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:image" content="https://gputoy.io/og-img.jpg" key="ogimg" />
      </Head>
      <Box
        height="100%"
        overflowY="scroll"
        overflowX="hidden"
        bg={themed('bg')}
      >
        <Flex
          width={["100%", "100%", "85%", "65%", "50%"]}
          position="relative"
          transform="translate(-50%, 0%)"
          left="50%"
          direction="column"
          flex="1 1 auto"
          onScroll={handleScroll}
          bg={themed('bg')}
          boxShadow="sm"
          borderX="1px"
          borderColor={themed("borderLight")}
        >
          <Section>
            <Box p={sectionPad} textAlign="center">

              <MainHeading redText='gputoy' pb="1rem">
                Welcome to
              </MainHeading>
              <MainDesc fontSize="md" textAlign="center">
                An open source project with an aim to make shader creation more interactive and collaborative
              </MainDesc>
              <SubDesc>
                Full editor functionality will be free forever
              </SubDesc>
              {
                gpuStatus == 'incompatible' &&
                <IncompatibilityError />
              }
            </Box>
            <Flex
              w="100%"
              bg="none"
              alignItems="center"
              flexDir="column"
              gridGap="1rem"
            >
              <DetailCard>
                <Stack p="1rem" px="4rem">
                  <MainHeading fontSize="2rem" fontWeight="bold">
                    Jump straight in
                  </MainHeading>
                  <MainDesc fontSize="normal">
                    No account required
                  </MainDesc>
                </Stack>

                <Link href="/editor" passHref>
                  <Button
                    mx="4rem"
                    px="1rem"
                    leftIcon={<IoCode />}
                    lineHeight="short"
                    variant="heavy"
                    p="0.5rem"
                    size="lg"
                  >
                    Editor
                  </Button>
                </Link>
              </DetailCard>
              <DetailCard>
                <Stack p="1rem" px="4rem">
                  <MainHeading fontSize="2rem" fontWeight="bold">
                    Contribute
                  </MainHeading>
                  <MainDesc fontSize="normal">
                    Help make GPUToy the best it possibly can be
                  </MainDesc>
                </Stack>

                <a href="https://github.com/theZiggurat/gputoy" target="_blank" rel="noreferrer">
                  <Button
                    mx="4rem"
                    px="1rem"
                    leftIcon={<FaGithub />}
                    lineHeight="short"
                    variant="heavy"
                    p="0.5rem"
                    size="lg"
                  >
                    GitHub
                  </Button>
                </a>
              </DetailCard>
            </Flex>
          </Section>

        </Flex>
        <Footer />
      </Box >

    </Scaffold >

  )
}

export default Home

import {
  Button, chakra, Flex, FlexProps, Heading, Image, Text, useColorModeValue
} from '@chakra-ui/react'
import Footer from '@components/index/footer'
import { CreatePageProjectQueryWithId, createPageProjectQueryWithId } from 'core/types/queries'
import prisma from 'core/backend/prisma'
import "@fontsource/jetbrains-mono"
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { BiPaint } from 'react-icons/bi'
import { BsClipboardData } from 'react-icons/bs'
import { themed } from 'theme/theme'
import Scaffold from '@components/shared/scaffold'

const Section = (props: FlexProps) => (
  <Flex flexDir="column" minH="100vh" p={["2rem", "2.5rem", "3rem", "5rem"]} mt="5rem" {...props}>
    {props.children}
  </Flex>
)

const MainHeading = (props: { children, redText: string }) => (
  <Heading fontFamily="'Segoe UI'" fontSize={["1.5rem", "1.8rem", "2rem", "3rem"]} pb="1rem" fontWeight="black">
    {props.children}
    <chakra.span fontFamily="'JetBrains Mono'" color="red.500" whiteSpace="nowrap">
      &nbsp;{props.redText}
    </chakra.span>
  </Heading>
)

const MainDesc = (props: { children }) => (
  <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize={["0.8rem", "0.8rem", "1rem", "1.2rem"]}>
    {props.children}
  </Text>
)

const SubDesc = (props: { children }) => (
  <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
    {props.children}
  </Text>
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
        <meta property="og:title" content="gputoy home" key="ogtitle" />
        <meta property="og:description" content="Create and share stunning shaders. Sign up for free using github." key="ogdesc" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:image" content="https://gputoy.io/og-img.jpg" key="ogimg" />
      </Head>
      <Flex width="100%" height="100%" position="relative" overflowY="scroll" overflowX="hidden" direction="column" flex="1 1 auto" onScroll={handleScroll}>
        <Flex flex="1" w="100vw" bg={themed('bg')} direction="column" textAlign="center">

          <Section>
            <MainHeading redText="in code">
              Convey your imagination
            </MainHeading>

            <MainDesc>
              A shader is a visual expression of mathematical beauty.
            </MainDesc>
            <SubDesc>
              Unlike a video, it is handcrafted. One pixel at a time.
            </SubDesc>
          </Section>

          <Section>
            <MainHeading redText="shading">
              No headaches, just jump in and start
            </MainHeading>
            <MainDesc>
              The editor provides all the tools needed to create your masterpiece.
            </MainDesc>
            <SubDesc>
              Unlike a video, it is handcrafted. One pixel at a time.
            </SubDesc>
          </Section>

          <Section>
            <MainHeading redText="instantly">
              Share Anywhere. Get Feedback
            </MainHeading>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1.2rem">
              With a multitude of export options.
            </Text>
            <Text fontFamily="Segoe UI" letterSpacing="3px" fontSize="1rem" mt="1rem" mb="3rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.600")}>
              Embed the editor on any website, or use right in your project with our npm package.
            </Text>
            {/* <iframe
              width="700px"
              height="400px"
              src="http://localhost:3000/embed?id=ckwis98mk0053awuntswa7rnf?mode=light"
              style={{
                borderRadius: "10px",
                borderColor: themed('border'),
                borderWidth: '1px',
                transform: tran ? '' : 'rotateX(90deg) rotateY(20deg)',
                transition: 'transform 3s ease',
                zoom: 1.25
              }}
            /> */}
          </Section>

          <Section minH="50vh">
            <MainHeading redText="web graphics">
              Build for the next generation of
            </MainHeading>
            <MainDesc>
              Made from the ground up for WebGPU, the new graphics standard for the web.
            </MainDesc>
            <SubDesc>
              Try wgsl, the official shading language of WebGPU, or stick to glsl.
            </SubDesc>

            <Flex pt="2rem" direction="row" justifyContent="center">
              <Image src={useColorModeValue("/wgpuLogo.svg", "/wgpuLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="WebGPU" />
              <Image src={useColorModeValue("/wgslLogo.svg", "/wgslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="WGSL" />
              <Image src={useColorModeValue("/glslLogo.svg", "/glslLogoDark.svg")} width="50px" height="50px" mx="1rem" filter="grayscale(30%)" alt="GLSL" />
            </Flex>
            <Flex alignItems="center" justifyContent="center" p="5rem" gridGap="1rem">
              <Button size="lg" bg='red.500' rightIcon={<BiPaint />}>
                Start Shading
              </Button>
              <Button size="lg" bg='red.500' rightIcon={<BsClipboardData />}>
                Sign Up for Free
              </Button>
            </Flex>

          </Section>



        </Flex>
        <Footer />
      </Flex>

    </Scaffold>

  )
}

export default Home

import {
    Box,
    Button, chakra, Flex, FlexProps, Heading, HeadingProps, Link, Stack, Text, TextProps, useColorModeValue
} from '@chakra-ui/react'
import Footer from '@components/index/footer'
import Scaffold from '@components/shared/scaffold'
import { gpuStatusAtom } from '@core/recoil/atoms/gpu'
import "@fontsource/jetbrains-mono"
import Head from 'next/head'
import { ReactNode, useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { IoCode, IoWarning } from 'react-icons/io5'
import { useRecoilValue } from 'recoil'
import { themed } from 'theme/theme'

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
    <Flex mt="2rem" bg="red.500" p="1rem" borderRadius="1rem" justifyContent="space-between" alignItems="center" color="whiteAlpha.800" boxShadow="lg">
      <IoWarning size="3rem" />
      <Box flex="1 1 auto">
        <Text fontSize="1.2rem" fontWeight="bold">
          Unfortunately, we don&apos;t support your browser yet!
        </Text>
        <Text fontSize="1rem" color="whiteAlpha.700">
          Click to view compatible browser versions.
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

const Home = () => {

  const [scrollPosition, setScrollPosition] = useState(0)
  const gpuStatus = useRecoilValue(gpuStatusAtom)

  const handleScroll = (ev) => {
    setScrollPosition(ev.target.scrollTop)
  };

  useEffect(() => {
  }, [scrollPosition])

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
        backgroundImage={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 4 4'%3E%3Cpath fill='%23${useColorModeValue('000', 'FFF')}' fill-opacity='0.1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");`}
      >
        <Flex
          width={["100%", "100%", "85%", "70%", "55%"]}
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

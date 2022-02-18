import {
  Button, chakra, Flex, IconButton, useColorModeValue, Text, Box, useToast, Tag, Badge, HStack, Link as ChakraLink
} from '@chakra-ui/react'
import NextLink from 'next/link'
import React, { useState } from 'react'
import { BiGitRepoForked, BiShare } from 'react-icons/bi'
import { themed } from '../../theme/theme'
import EditDropdown from './dropdowns/edit'
import FileDropdown from './dropdowns/file'
import ProjectDropdown from './dropdowns/project'
import SettingsDropdown from './dropdowns/settings'
import ViewDropdown from './dropdowns/view'
import { MdOutlineArrowDropDown, MdPublishedWithChanges } from 'react-icons/md'
import { AiFillCheckCircle, AiOutlineCloudServer } from 'react-icons/ai'
import usePanels from '@core/hooks/usePanels'
import { useProjectAuthor, useProjectTitle } from '@core/hooks/useProjectMetadata'
import { Divider } from '@components/shared/misc/micro'
import NavUser from '@components/shared/user'
import usePost from '@core/hooks/usePost'
import { useRecoilValue } from 'recoil'
import { projectLastSave, projectLastSaveLocal } from 'core/recoil/atoms/project'
import { fmtTimeSpan } from 'utils/dates'
import useFork from 'core/hooks/useFork'
import useProjectSession from '@core/hooks/useProjectSession'
import useHorizontalScroll from 'utils/scrollHook'
import { FaGithub } from 'react-icons/fa'

const Logo = (props: { color: string }) => {
  return <svg width="22" height="22" viewBox="0 0 50 50">
    <g fill={props.color}>
      <g transform="scale(10)" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.726,1.855C3.44,2.127,3.042,2.237,2.661,2.292c-0.34,0.05-0.695,0.071-0.999,0.203C1.344,2.634,1.144,2.864,1.16,3.22   c0.01,0.214,0.125,0.423,0.287,0.584C1.492,3.84,1.538,3.874,1.586,3.905C1.583,3.899,1.58,3.892,1.575,3.886   C1.382,3.621,1.232,2.862,2.242,2.697C2.445,2.664,2.648,2.63,2.85,2.584c0.178-0.041,0.496-0.141,0.531-0.16   c0.029-0.017-0.189,0.228-0.857,0.42C1.463,3.149,1.789,4.03,2.113,4.131C2.237,4.161,2.367,4.176,2.5,4.176   c0.926,0,1.677-0.75,1.677-1.676c0-0.333-0.097-0.643-0.264-0.903C3.868,1.695,3.805,1.779,3.726,1.855z">
        </path>
        <path
          d="M0.824,2.5c0,0.184,0.03,0.359,0.084,0.525c0.02-0.182,0.082-0.354,0.198-0.5c0.21-0.267,0.536-0.392,0.875-0.459   C2.319,2,2.679,1.992,3.026,1.908c0.192-0.046,0.387-0.121,0.542-0.244C3.697,1.56,3.757,1.402,3.623,1.255   C3.574,1.211,3.522,1.169,3.468,1.131c0.098,0.201,0.022,0.5-0.773,0.578C2.491,1.73,2.288,1.749,2.087,1.777   C2.028,1.785,1.955,1.796,1.88,1.809c0,0,0.066-0.082,0.532-0.188c0.958-0.216,0.779-0.633,0.495-0.748   c-0.13-0.032-0.267-0.05-0.407-0.05C1.574,0.824,0.824,1.574,0.824,2.5z">
        </path>
      </g>
    </g>
  </svg>
}

const ProjectInfo = () => {

  const [title, _] = useProjectTitle()
  const author = useProjectAuthor()
  const { addPanel } = usePanels({})
  const [open, setOpen] = useState(false)

  const toggleSummary = () => {
    addPanel(5, 'left')
  }

  return (
    <Box pos="relative" display="inline">
      <Button bg="none" onClick={toggleSummary} borderRadius="0">
        <Text
          minW="min-content"
          fontSize="sm"
          fontWeight="bold"
          bg="none"
          border="none"
          color={themed('textMid')}
        >
          {title}
        </Text>
        &nbsp;&nbsp;&#183;&nbsp;&nbsp;
        <Text
          minW="min-content"
          fontSize="sm"
          fontWeight="thin"
          bg="none"
          border="none"
        >
          {author?.name ?? 'Anonymous'}
        </Text>

      </Button>
      <IconButton
        display="inline"
        aria-label="Save status"
        variant="empty"
        size="xs"
        icon={<MdOutlineArrowDropDown
          size={15}
          style={{
            transform: open ? "rotate(180deg)" : "",
            transition: "transform 0.3s ease"
          }} />}
        onClick={() => setOpen(o => !o)}
      />
      <SaveBox opened={open} />
    </Box>
  )
}

const SaveBox = (props: { opened?: boolean }) => {

  const lastSave = useRecoilValue(projectLastSave)
  const lastSaveLocal = useRecoilValue(projectLastSaveLocal)

  const hoursSinceSave = lastSave ? fmtTimeSpan(Date.parse(lastSave)) + " ago" : null

  return (
    <Flex
      pos="absolute"
      width="200px"
      overflowY="clip"
      left="50%"
      transform="translate(-50%, 0px)"
      bg={themed('a2')}
      top="100%"
      height="fit-content"
      border="1px"
      borderColor={themed('border')}
      alignItems="center"
      flexDir="column"
      maxH={props.opened ? "100px" : "0px"}
      opacity={props.opened ? "1" : "0"}
      transition="max-height 0.3s ease, opacity 0.3s ease"
    >

      <Box p="0.5rem" textAlign="center">

        <Text fontSize="lg" color={themed('textMid')}>
          <AiOutlineCloudServer style={{ display: 'inline', marginRight: "0.5rem" }} />
          Last cloud save
        </Text>
        <Text fontSize="xs" fontWeight="bold" color={themed('textLight')}>
          {
            hoursSinceSave ?? "Never"
          }

        </Text>

      </Box>
      <Divider />
      <Text fontSize="xs" color={themed('textMidLight')} p="0.5rem" textAlign="center">
        <AiFillCheckCircle style={{ display: 'inline', marginRight: "0.5rem" }} />
        Automatically saved to device
      </Text>
    </Flex>
  )
}

const NavLeft = () => {

  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <Flex
      flex="1"
      height="100%"
      marginRight="auto"
      minW="min-content"
      alignItems="center"
      justifyContent="left"
      px="0.7rem"
    >
      <NextLink href="/" passHref>
        <Box
          maxW={logoHovered ? "300px" : '30px'}
          whiteSpace="nowrap"
          overflowX="clip"
          transition="max-width 0.5s ease"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          bg={logoHovered ? themed('button') : 'none'}
          borderRadius="500px"
          pr="1rem"
        >
          <IconButton
            variant="empty"
            aria-label="Home"
            borderRadius="500px"
            icon={<Logo color={useColorModeValue('rgba(0, 0, 0, 0.72)', 'rgba(255, 255, 255, 0.8)')} />}
            transform={logoHovered ? 'rotate(360deg)' : ''}
            transition="transform 0.5s ease"
          />
          <Box
            opacity={logoHovered ? "1" : '0'}
            transition="0.5s opacity ease"
            display="inline"
          >
            <NextLink href="/browse" passHref>
              <Button bg="none" borderRadius="none">
                Browse
              </Button>
            </NextLink>
            <NextLink href="/market" passHref>
              <Button bg="none" borderRadius="none">
                Extend
              </Button>
            </NextLink>
            <NextLink href="/" passHref>
              <Button bg="none" borderRadius="none">
                Resources
              </Button>
            </NextLink>
          </Box>
        </Box>
      </NextLink>


      <Flex
        opacity={logoHovered ? "0" : '1'}
        transition="0.5s opacity ease"
        ml="0.5rem"
      >
        <FileDropdown />
        <EditDropdown />
        <ViewDropdown />
        <ProjectDropdown />
        <SettingsDropdown />
      </Flex>
    </Flex>
  )
}

const NavEnd = () => {

  const [post, canPost] = usePost()
  const fork = useFork()
  const [_s, _l, isOwner] = useProjectSession()

  return (
    <Flex
      flex="1"
      height="100%"
      marginRight="auto"
      minW="min-content"
      alignItems="center"
      justifyContent="right"
      px="0.5rem"
    >
      <Button
        size="sm"
        h="1.6rem"
        px="0.5rem"
        mx="0.2rem"
        border="0px"
        borderRadius="3px"
        leftIcon={<BiShare />}
        disabled={!canPost}
      >
        Share
      </Button>
      <Button
        size="sm"
        h="1.6rem"
        px="0.5rem"
        mx="0.2rem"
        border="0px"
        borderRadius="3px"
        leftIcon={<MdPublishedWithChanges />}
        onClick={() => post('publish')}
        disabled={!canPost}
      >
        Publish
      </Button>
      <Button
        size="sm"
        h="1.6rem"
        px="0.5rem"
        mx="0.2rem"
        border="0px"
        borderRadius="3px"
        leftIcon={<BiGitRepoForked />}
        onClick={() => fork()}
      >
        Fork
      </Button>
      <NavUser />
    </Flex>
  )
}


export default function Nav() {

  const scrollRef = useHorizontalScroll()

  return (
    <chakra.nav
      h='2.5rem'
      minH="2.5rem"
      justifyContent="space-between"
      alignItems='center'
      zIndex="1"
      borderBottom="1px"
      bg={themed('a2')}
      borderColor={themed('border')}
      display="flex"
    >
      <NavLeft />
      <ProjectInfo />
      <NavEnd />
      <ChakraLink href="https://github.com/theZiggurat/gputoy" target="_blank">
        <Badge variant="heavy" borderRadius="none" mr="0.5rem" textTransform="none" h="1.5rem" textAlign="center" cursor="pointer" userSelect="none">
          <HStack>
            <Text>
              v0.1 pre-alpha

            </Text>
            <FaGithub />
          </HStack>
        </Badge>
      </ChakraLink>
    </chakra.nav >
  );
}
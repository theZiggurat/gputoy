import { ArrowDownIcon } from '@chakra-ui/icons';
import {
  Badge, Button, chakra, Flex, Text, HStack, useMediaQuery, IconButton, useColorModeValue
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { ReactElement, ReactNode, useState } from 'react';
import { BsArrowDownCircle, BsPatchExclamationFill } from 'react-icons/bs';
import { themed } from '../../theme/theme';
import NavUser from './user';
import { IoMdArrowDropdown } from 'react-icons/io'
import { RiArrowDownSLine } from 'react-icons/ri';
import { MdMenu } from 'react-icons/md';
import Link from 'next/link';
import { FaTags } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai'


const navlinks = [
  [
    {
      text: 'New',
      icon: <BsPatchExclamationFill />,
      href: '/browse'
    },
    {
      text: 'Featured',
      icon: <AiFillStar />,
      href: '/browse'
    },
    {
      text: 'Tags',
      icon: <FaTags />,
      href: '/browse'
    },
  ],
  [
    {
      text: 'Wgsl Project',
      icon: <AiFillStar />,
      href: '/create'
    },
    {
      text: 'Glsl Project',
      icon: <BsPatchExclamationFill />,
      href: '/create'
    },
    {
      text: 'From starter',
      icon: <FaTags />,
      href: '/create'
    },
  ],
  [
    {
      text: 'Functions',
      icon: <AiFillStar />,
      href: '/create'
    },
    {
      text: 'Passes',
      icon: <BsPatchExclamationFill />,
      href: '/create'
    },
    {
      text: 'Blocks',
      icon: <FaTags />,
      href: '/create'
    },
  ],
  [
    {
      text: 'Documentation',
      icon: <AiFillStar />,
      href: '/create'
    },
    {
      text: 'IDE',
      icon: <BsPatchExclamationFill />,
      href: '/create'
    },
    {
      text: 'Shader School',
      icon: <FaTags />,
      href: '/create'
    },
    {
      text: 'About',
      icon: <FaTags />,
      href: '/create'
    },
  ],
]

interface NavLinkProps {
  text: string,
  onHover: (idx: number) => void,
  index: number
  first?: boolean,
  last?: boolean,
}

const NavLink = (props: NavLinkProps) => {
  return (
    <chakra.li
      display="inline-block"
      onClick={() => props.onHover(props.index)}
      onMouseEnter={() => props.onHover(props.index)}
    >
      <Button
        fontWeight="med"
        fontSize="sm"
        variant="empty"
        rightIcon={<RiArrowDownSLine size="0.6rem" />}
        mx="1.5rem"
        color={themed('textMid')}
        transition="color 0.4s ease"
        _hover={{
          color: themed('textHigh'),
          bg: 'none'
        }}
      >
        {props.text}
      </Button>
    </chakra.li>
  )
}


type NavSubLinkProps = {
  text: string,
  icon: ReactElement,
  href: string,
}
const NavSubLink = (props: NavSubLinkProps) => (
  <Link href={props.href} passHref>
    <Button variant="empty" leftIcon={props.icon} size="lg">
      {props.text}
    </Button>
  </Link>
)

export default function Nav() {

  const [isMobile] = useMediaQuery('(max-width: 1014px)')
  const [navLinkIndex, setNavLinkIndex] = useState(-1)

  const onHandleHover = (idx: number) => setNavLinkIndex(idx)
  const onHandleLeave = () => setNavLinkIndex(-1)

  const logoColor = useColorModeValue('rgba(0, 0, 0, 0.72)', 'rgba(255, 255, 255, 0.8)')

  return (
    <chakra.nav
      minH='4rem'
      justifyContent="center"
      alignItems='center'
      zIndex="1"
      borderBottom="1px"
      bg={themed('bg')}
      borderColor={themed('border')}
      display="flex"
    >
      {
        !isMobile &&
        <>
          <NextLink href="/">
            <HStack>
              <svg width="30" height="50" viewBox="0 0 50 50">
                <g fill={logoColor}>
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
              <Text fontSize={22} fontWeight="extrabold" cursor="pointer">
                GPUTOY
              </Text>
            </HStack>
          </NextLink>
          <chakra.ul
            listStyleType="none"
            display="inline-block"
            mx="4rem"
          >
            <NavLink text="Browse" onHover={onHandleHover} index={0} />
            <NavLink text="Create" onHover={onHandleHover} index={1} />
            <NavLink text="Extend" onHover={onHandleHover} index={2} />
            <NavLink text="Resources" onHover={onHandleHover} index={3} />
          </chakra.ul >
          <Text fontWeight="med" fontSize="sm" color={themed('textMid')}>
            Sign in
          </Text>
          <Button bg="red.500" color="dark.textMid" border="none" size="sm" ml="3rem">
            Start Shading
          </Button>
          <Flex
            justifyContent="center"
            alignItems="center"
            pos="absolute"
            w="100%"
            height="6rem"
            bg={themed('bg')}
            borderBottom="1px"
            borderColor={themed('border')}
            top="4rem"
            gridGap="2rem"
            onMouseLeave={onHandleLeave}
            opacity={navLinkIndex >= 0 ? 1 : 0}
            //clipPath={navLinkIndex >= 0 ? "inset(0 0 0 0)" : "inset(0 0 100% 0)"}
            maxH={navLinkIndex >= 0 ? '6rem' : '0rem'}
            transition="max-height 0.4s ease, opacity 0.4s ease"
          >
            {navlinks[navLinkIndex]?.map(p => <NavSubLink key={p.text} {...p} />)}
          </Flex>

        </>
      }
      {
        isMobile &&
        <Flex width="100%" px={["1rem", "2rem", "3rem"]} justifyContent="space-between">
          <NextLink href="/">
            <HStack>
              <svg width="30" height="50" viewBox="0 0 50 50">
                <g fill={'white'}>
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
              <Text fontSize={22} fontWeight="extrabold" cursor="pointer">
                GPUTOY
              </Text>
            </HStack>
          </NextLink>
          <HStack gridGap="2rem">
            <Text fontWeight="med" fontSize="sm" color={themed('textMid')} ml="3rem">
              Sign in
            </Text>
            <IconButton icon={<MdMenu />} aria-label="Menu">

            </IconButton>
          </HStack>
        </Flex>
      }
    </chakra.nav>


  );
}
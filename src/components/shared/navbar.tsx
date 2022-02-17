import {
  Badge, Button, chakra, Flex, Text, HStack, useMediaQuery, IconButton, useColorModeValue, Box, useColorMode
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { ReactNode } from 'react';
import { themed } from '../../theme/theme';
import NavUser from './user';
import { MdMenu } from 'react-icons/md';
import Link from 'next/link';
import { IoCode } from 'react-icons/io5';
import { FaMoon, FaSun } from 'react-icons/fa';

interface NavLinkProps {
  text: string | ReactNode,
  href: string
}

const NavLink = (props: NavLinkProps) => {
  return (
    <Link href={props.href} passHref>
      <Text
        display="inline"
        userSelect="none"
        cursor="pointer"
        fontSize="0.9rem"
        p="0.5rem"
        m="1.5rem"
        _hover={{
          bg: themed('buttonHovered')
        }}
        color={themed('textMidLight')}
      >
        {props.text}
      </Text>
    </Link>
  )
}

export default function Nav() {

  const [isMobile] = useMediaQuery('(max-width: 1014px)')
  const logoColor = useColorModeValue('rgba(0, 0, 0, 0.72)', 'rgba(255, 255, 255, 0.8)')
  const { colorMode, toggleColorMode } = useColorMode()

  const nightButtonProps = useColorModeValue(
    {
      icon: <FaMoon />,
      "aria-label": "Switch to dark mode"
    },
    {
      icon: <FaSun />,
      "aria-label": "Switch to light mode"
    }
  )

  return (
    <chakra.nav
      minH='4rem'
      justifyContent="center"
      alignItems='center'
      zIndex="1"
      borderBottom={useColorModeValue("none", "1px")}
      bg={themed('bg')}
      borderColor={themed('border')}
      display="flex"
      boxShadow="0px 3px 6px 0px rgba(0,0,0,0.1)"
    >
      {
        !isMobile &&
        <>
          <Link href="/" passHref>
            <HStack pos="relative" cursor="pointer" userSelect="none">
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
              <Text fontSize={22} fontWeight="extrabold" cursor="pointer" color={logoColor}>
                GPUTOY
              </Text>
              <Badge fontSize="0.5rem" pos="absolute" right="0rem" bottom="0rem" variant="heavy" border="none" p="0.05rem" textTransform="none">
                &nbsp;v0.1 pre-alpha&nbsp;
              </Badge>
            </HStack>
          </Link>
          <chakra.ul
            listStyleType="none"
            display="inline-block"
            mx="4rem"
          >
            <NavLink href="/browse" text="Shaders" />
            <NavLink href="/extend" text="Tools" />
            <NavLink href="/about" text="About" />

          </chakra.ul >

          <NavUser variant="empty" fontWeight="normal" color={themed('textMid')} textAlign="center" lineHeight="short" leftIcon={undefined} offset="2.5rem" center />

          {/* 
            theres some weird css inheretence/leakage going on here where these buttons will grow to the largest size possible in the navbar. 
            these boxes protect them but there should be a cleaner solution
          */}
          <Box>
            <Link href="/editor" passHref>
              <Button
                mx="4rem"
                px="1rem"
                leftIcon={<IoCode />}
                lineHeight="short"
                variant="heavy"
                p="0.5rem"
              >
                Editor
              </Button>
            </Link>
          </Box>
          <Box>
            <IconButton
              {...nightButtonProps}
              onClick={toggleColorMode}
            />
          </Box>
        </>
      }
      {
        isMobile &&
        <Flex width="100%" px={["1rem", "2rem", "3rem"]} justifyContent="space-between">
          <Link href="/" passHref>
            <HStack pos="relative" cursor="pointer" userSelect="none">
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
              <Text fontSize={22} fontWeight="extrabold" cursor="pointer" color={logoColor}>
                GPUTOY
              </Text>
              <Badge fontSize="0.5rem" pos="absolute" right="0rem" bottom="0rem" variant="heavy" border="none" p="0.05rem" textTransform="none">
                &nbsp;v0.1 pre-alpha&nbsp;
              </Badge>
            </HStack>
          </Link>
          <HStack gridGap="2rem">
            <Text fontWeight="med" fontSize="sm" color={themed('textMid')} ml="3rem">
              Sign in
            </Text>
            <IconButton icon={<MdMenu />} aria-label="Menu" />
          </HStack>
        </Flex>
      }
    </chakra.nav >


  );
}
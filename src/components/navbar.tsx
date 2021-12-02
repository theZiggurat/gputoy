import {
  chakra,
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuList,
  MenuItem, 
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  HStack,
  Icon,
  Badge,
  MenuButton,
  Divider
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ReactChildren, ReactNode } from 'react';
import { MdNightlight, MdWbSunny} from 'react-icons/md'

import { useResetRecoilState } from 'recoil';
import { layoutState } from '../recoil/atoms';
import UserMenu from './user';


interface NavLinkProps {
  href: string,
  text: string,
  currentPath: string,
}

const NavLink = (props: NavLinkProps) => {
  const selected = props.currentPath === props.href

  return(
    <NextLink href={props.href} passHref replace>
      <Button rounded='md' cursor="pointer" userSelect="none" size="sm"
        bg= { selected ? useColorModeValue('blackAlpha.100', 'whiteAlpha.100') : 'inheret' }
        shadow={ selected  ? '0px 0px 2px 1px rgba(255, 255, 255, 0.1)' : 'inherit'}
        _hover={{
          bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50'),
          shadow: "lg"
          }}>
        {props.text}
      </Button>
    </NextLink>
  )
};

export default function Nav(props: {children?: ReactNode}) {

  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const isActive = router.pathname == '/'; 

  const resetLayout = useResetRecoilState(layoutState)

  const onReset = () => resetLayout()

  return (
      <Box bg={useColorModeValue('gray.200', 'gray.900')} px={4} flex="0 0 auto" shadow="inner" zIndex="1">
        <Flex h='3rem' alignItems='center' justifyContent='center'>

          <HStack flex='1 1 auto'>
            <Box m={0} mr={5} fontSize={20} fontWeight="extrabold">
              <NextLink href="/">
                GPUTOY
              </NextLink>
              <Badge ml="1" position="relative" colorScheme="blue" fontSize="0.4em" top="-.25em">
                  Dev
                </Badge>
            </Box>
            <NavLink href="/browse" text="Browse" currentPath={router.pathname}/>
            <NavLink href="/create" text="Create" currentPath={router.pathname} />
            <NavLink href="/projects" text="Projects" currentPath={router.pathname}/>
            
          </HStack>

          {props.children}
        
          <Flex alignItems={'center'} flex='1 1 auto' justifyContent='end'>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode} size="sm">
                <Icon as={colorMode==="light" ? MdWbSunny : MdNightlight}/>
              </Button>
              <UserMenu/>
            </Stack>
          </Flex>
        </Flex>
      </Box>
  );
}
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
  Divider,
  Text
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ReactChildren, ReactNode, useState } from 'react';
import { MdNightlight, MdWbSunny} from 'react-icons/md'

import { useResetRecoilState } from 'recoil';
import { layoutState } from '../recoil/atoms';
import NavUser from './user';


interface NavLinkProps {
  href: string,
  text: string,
  currentPath: string,
}

const NavLink = (props: NavLinkProps) => {
  const selected = props.currentPath === props.href
  return(
    <NextLink href={props.href} passHref>
      <Button 
        rounded='md' 
        cursor="pointer" 
        userSelect="none" 
        p="1em"
        size="sm"
        bg={ selected ? useColorModeValue('blackAlpha.100', 'whiteAlpha.100') : ''}
        _hover={{
          bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
          shadow: "lg"
        }}
      >
        {props.text}
      </Button>
    </NextLink>
  )
};

export default function Nav(props: {children?: ReactNode}) {

  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const isActive = router.pathname == '/'; 

  const [toggled, st] = useState(false)
  const oc = () => st(t =>  !t)

  const resetLayout = useResetRecoilState(layoutState)

  const onReset = () => resetLayout()

  return (
    <Flex 
      bg={useColorModeValue('gray.200', 'gray.900')}
      h='3rem' 
      justifyContent="center"
      alignItems='center'
      zIndex="1"
    >
      <HStack 
        flex="1"
        marginRight="auto"
        minW="min-content"
        px="1rem"
      >
        <NextLink href="/">
          <Text fontSize={22} fontWeight="extrabold" cursor="pointer">
            GPUTOY
          </Text>
        </NextLink>
        <Badge colorScheme="blue" fontSize="0.6em" cursor="default" style={{marginRight: '1rem'}}>
          Dev
        </Badge>
        <NavLink href="/browse" text="Browse" currentPath={router.pathname}/>
        <NavLink href="/create" text="Create" currentPath={router.pathname} />
        <NavLink href="/market" text="Market" currentPath={router.pathname}/>            
      </HStack>

      {props.children}
    
      <Flex 
        flex="1"
        alignItems={'center'} 
        justifyContent='end'
        marginLeft="auto"
        minW="min-content"
        px="1rem"
      >
        <NavUser/>
      </Flex>
    </Flex>
  );
}
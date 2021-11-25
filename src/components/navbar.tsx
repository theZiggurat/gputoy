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
  MenuButton
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
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
  return(
    <NextLink href={props.href} passHref>
      <chakra.span px={3} py={1} rounded={'md'} cursor="pointer" userSelect="none"
        bg={ props.currentPath === props.href ? 
            useColorModeValue('gray.300', 'gray.700') : 'inheret'}
        shadow={ props.currentPath === props.href ? 'lg' : 'inherit'}
        _hover={{
          bg: useColorModeValue('gray.300', 'gray.700'),
          shadow: "lg"
          }}>
        {props.text}
      </chakra.span>
    </NextLink>
  )
};

export default function Nav() {

  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const isActive = router.pathname == '/'; 

  const resetLayout = useResetRecoilState(layoutState)

  const onReset = () => resetLayout()

  return (
      <Box bg={useColorModeValue('gray.200', 'gray.900')} px={4} flex="0 0 auto" shadow="inner">
        <Flex h={16} alignItems={'center'} justifyContent='space-between' >

          <HStack>
            <Box m={5} marginRight={10} fontSize={25} fontWeight="extrabold">
              <NextLink href="/">
                GPUTOY
              </NextLink>
              <Badge ml="1" position="relative" colorScheme="blue" fontSize="0.4em" top="-.25em">
                  Dev
                </Badge>
            </Box>
            <NavLink href="/browse" text="Browse" currentPath={router.pathname}/>
            <NavLink href="/create" text="Create" currentPath={router.pathname}/>
            <NavLink href="/projects" text="Projects" currentPath={router.pathname}/>
            <Button onClick={onReset}>Reset</Button>
          </HStack>
        
          <Flex alignItems={'center'}>
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
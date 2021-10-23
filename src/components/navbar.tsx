import { ReactNode, useEffect } from 'react';
import {
  chakra,
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
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
  Badge
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { MdNightlight, MdWbSunny} from 'react-icons/md'

interface NavLinkProps {
  href: string,
  text: string,
  currentPath: string,
}

const NavLink = (props: NavLinkProps) => {
  return(
    <NextLink href={props.href} passHref>
      <chakra.span px={3} py={1} rounded={'md'} cursor="pointer"
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const isActive = router.pathname == '/'; 
  console.log(router.pathname)

  return (
      <Box bg={useColorModeValue('gray.200', 'gray.900')} px={4} flex="0 0 auto" shadow="inner">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'} >

          

          <HStack>
            <Box m={5} marginRight={10} fontSize={25} fontWeight="extrabold">
              <NextLink href="/">
                Shdr
              </NextLink>
              <Badge ml="1" position="relative" colorScheme="blue" fontSize="0.4em" top="-.25em">
                  Alpha
                </Badge>
            </Box>
            <NavLink href="/browse" text="Browse" currentPath={router.pathname}/>
            <NavLink href="/create" text="Create" currentPath={router.pathname}/>
            <NavLink href="/projects" text="Projects" currentPath={router.pathname}/>
          </HStack>
          

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button onClick={toggleColorMode} size="sm">
                <Icon as={colorMode==="light" ? MdWbSunny : MdNightlight}/>
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={'https://avatars.dicebear.com/api/male/username.svg'}
                  />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={'https://avatars.dicebear.com/api/male/username.svg'}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>Username</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem>Your Servers</MenuItem>
                  <MenuItem>Account Settings</MenuItem>
                  <MenuItem>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
  );
}
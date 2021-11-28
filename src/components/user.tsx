import { Menu, MenuButton, MenuDivider, MenuItem,  MenuList } from '@chakra-ui/menu'
import { Avatar, Box, Button, Center, Stack } from '@chakra-ui/react'
import React, { useEffect } from 'react'

import NextLink from 'next/link';

import Link from 'next/link'
import {useRouter} from 'next/router'
import {signOut, signout, useSession} from 'next-auth/client'
import prisma from '../../lib/prisma';

const UserMenu = () => {

  const router = useRouter()
  const [session, loading] = useSession()

  let comp = (
    <Box>
      Nothin
    </Box>
  )

  if(loading) {
    comp = (
      <Box>
        Loading...
      </Box>
    )
  }

  if (session === null) {
    comp = (
      <Box>
        <Link href="/api/auth/signin">
          <Button>
            Sign In
          </Button>
        </Link>
        
        <Link href="/api/auth/signup">
          <Button>
            Sign Up
          </Button>
        </Link>
      </Box>
    )
  }

  if (session) {
    comp = <Box>
      Hello {session.user?.name}
      <Button onClick={() => signOut()}>
        Signout
      </Button>
    </Box>
  }

  return comp

  // return <Menu>
  //   <MenuButton
  //     id="menubutton"
  //     as={Button}
  //     rounded={'full'}
  //     variant={'link'}
  //     cursor={'pointer'}
  //     minW={0}>
  //     <Avatar
  //       size={'sm'}
  //       name={user?.nickname ?? undefined}
  //       src={user?.picture ?? undefined}
  //     />
  //   </MenuButton>
  //   {
  //     user &&
  //     <MenuList alignItems={'center'}>
  //       <br />
  //       <Center>
  //         <Avatar colorScheme="blackAlpha"
  //           name={user?.nickname ?? undefined}
  //           src={user?.picture ?? undefined}
  //         />
  //       </Center>
  //       <br />
  //       <Stack whiteSpace="pre-line">
  //         <p>{user.nickname}</p>
  //         <br/>
  //         <p>{user.name}</p>
  //       </Stack>
  //       <br />
  //       <MenuDivider />
  //       <MenuItem>Account Settings</MenuItem>
  //       <NextLink href='/api/auth/logout' passHref>Logout</NextLink>
  //     </MenuList>
  //   }
  //   {
  //     !user &&
  //     <MenuList alignItems={'center'}>
  //       <MenuItem>
  //         <NextLink href='/api/auth/login' passHref>Login</NextLink>
  //       </MenuItem>
  //     </MenuList>
  //   }
    
  // </Menu>
}

export default UserMenu
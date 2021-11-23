import { useUser } from '@auth0/nextjs-auth0'
import { Menu, MenuButton, MenuDivider, MenuItem,  MenuList } from '@chakra-ui/menu'
import { Avatar, Button, Center, Stack } from '@chakra-ui/react'
import React from 'react'

import NextLink from 'next/link';

const UserMenu = () => {
  const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return <Menu>
    <MenuButton
      id="menubutton"
      as={Button}
      rounded={'full'}
      variant={'link'}
      cursor={'pointer'}
      minW={0}>
      <Avatar
        size={'sm'}
        name={user?.nickname ?? undefined}
        src={user?.picture ?? undefined}
      />
    </MenuButton>
    {
      user &&
      <MenuList alignItems={'center'}>
        <br />
        <Center>
          <Avatar colorScheme="blackAlpha"
            name={user?.nickname ?? undefined}
            src={user?.picture ?? undefined}
          />
        </Center>
        <br />
        <Stack whiteSpace="pre-line">
          <p>{user.nickname}</p>
          <br/>
          <p>{user.name}</p>
        </Stack>
        <br />
        <MenuDivider />
        <MenuItem>Account Settings</MenuItem>
        <NextLink href='/api/auth/logout' passHref>Logout</NextLink>
      </MenuList>
    }
    {
      !user &&
      <MenuList alignItems={'center'}>
        <MenuItem>
          <NextLink href='/api/auth/login' passHref>Login</NextLink>
        </MenuItem>
      </MenuList>
    }
    
  </Menu>
}

export default UserMenu
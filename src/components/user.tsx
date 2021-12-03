import { Menu, MenuButton, MenuDivider, MenuItem,  MenuList } from '@chakra-ui/menu'
import { 
	Avatar, 
	Flex,
	Box,
	Button, 
	Center, 
	Stack,
	Text,
	useColorModeValue,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Portal,
	Spinner
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

import NextLink from 'next/link';

import Link from 'next/link'
import {useRouter} from 'next/router'
import {signIn, signOut, signout, useSession} from 'next-auth/client'
import { Session } from 'next-auth';

type UserMenuProps = {
	session?: Session
	loading: boolean
}
const UserMenu = (props: UserMenuProps) => {

	const { session, loading } = props

	let inner
	if (loading) {
		inner = (
			<Center width='100%' height='10rem'>
				<Spinner/>
			</Center>
		)
	}

	if (!session) {
		inner = (
			<>
				<Button onClick={() => signIn('github')} m="0.5rem" width="fit-content">
					Sign in with Github
				</Button>
				<Button onClick={() => signIn('google')} m="0.5rem" width="fit-content">
					Sign in with Google
				</Button>
			</>
		)
	}

	if (session) {
		inner = (
			<>
				<Flex p='1rem'>
					Hello
				</Flex>
				<Button onClick={() => signOut()} m="1rem" width="fit-content">
					Sign out
				</Button>
			</>
		)
	}

	return (
		<Flex 
			minW="min-content"
			direction="column" 
			borderRadius="md" 
			borderTopRadius="0px"
		>
			{inner}
		</Flex>
	)
}

const NavUser = () => {

  const router = useRouter()
  const [session, loading] = useSession()

	const [isOpen, setIsOpen] = useState(false)
	const togglePopover = () => setIsOpen(o => !o)

	const defaultColor = useColorModeValue('light.button', 'dark.button')
	const activeColor = useColorModeValue('light.buttonHovered', 'dark.buttonHovered')

  return (
		<Popover 
			placement='bottom-start'
			isOpen={isOpen}
			gutter={7}
		>
			<PopoverTrigger>
				<Flex 
					backgroundColor={isOpen ? activeColor : defaultColor}
					borderEndRadius="50vh"
					alignItems="center"
					cursor="pointer"
					onClick={togglePopover}
					_hover={{
						backgroundColor: activeColor
					}}
				>
					<Text 
						px="1em"
						fontSize="0.9em"
					>
						{session?.user?.name ?? 'Sign In'}
					</Text>
					<Avatar 
						name={session?.user?.name ?? undefined}
						src={session?.user?.image ?? undefined}
						size="sm"
					/>
				</Flex>
			</PopoverTrigger>
			<Portal>
				<PopoverContent 
					width="fit-content"
					backgroundColor={useColorModeValue('light.a2', 'dark.a2')}
					borderColor="blackAlpha.100"
					borderTopRadius="0px"
					outline="none"
					border="none"
				>
					<UserMenu session={session ?? undefined} loading={loading}/>
				</PopoverContent>
			</Portal>
		</Popover>
  )
}

export default NavUser

{/* <Button onClick={toggleColorMode} size="sm">
	<Icon as={colorMode==="light" ? MdWbSunny : MdNightlight}/>
</Button> */}
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
import {signOut, signout, useSession} from 'next-auth/client'
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

	return (
		<Flex 
			minW="20rem"
			direction="column" 
			borderRadius="md" 
			backgroundColor={useColorModeValue('blackAlpha.200', 'whiteAlpha.100')} 
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

  return (
		<Popover 
			placement='bottom-start'
			isOpen={isOpen}
			gutter={0}
		>
			<PopoverTrigger>
				<Flex 
					backgroundColor={useColorModeValue('blackAlpha.200', 'whiteAlpha.200')} 
					borderStartRadius="15vh" 
					borderEndRadius="50vh"
					alignItems="center"
					cursor="pointer"
					onClick={togglePopover}
				>
					<Text 
						px="1em"
						fontFamily="'JetBrains Mono'"
						fontWeight="light"
						fontSize="0.8em"
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
					backgroundColor="gray.850"
					borderColor="blackAlpha.100"
					outline="none"
					border="none"
				>
					<UserMenu session={session ?? undefined} loading/>
				</PopoverContent>
			</Portal>
		</Popover>
  )
}

export default NavUser

{/* <Button onClick={toggleColorMode} size="sm">
	<Icon as={colorMode==="light" ? MdWbSunny : MdNightlight}/>
</Button> */}
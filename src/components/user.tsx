import { 
	Avatar, 
	Flex,
	Button, 
	Center, 
	Text,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Portal,
	Spinner
} from '@chakra-ui/react'
import React, { ReactElement, useState } from 'react'

import {useRouter} from 'next/router'
import {signIn, signOut, useSession} from 'next-auth/client'
import { Session } from 'next-auth';

import { RiProjector2Fill } from 'react-icons/ri'
import { MdSettings } from 'react-icons/md';
import { IoExit } from 'react-icons/io5'
import { themed } from '../theme/theme';

const MenuButton = (props: {
	text: string, 
	onClick?: () => void, 
	icon?: ReactElement,
	last?: boolean
}) => {
	return (
		<Flex
			as={Button} 
			onClick={props.onClick}
			width="100%" 
			mt="0.5em" 
			bg={themed('input')}
			borderTopRadius="0px"
			borderBottomRadius={props.last ? "md":"0px"}
			textAlign="left"
			px="1rem"
			fontWeight="normal"
			justifyContent="space-between"
		>
			{props.text}
			{props.icon}
		</Flex>
	)
}

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
				<MenuButton text="Sign in with Github" onClick={() => signIn('github')}/>
				<MenuButton text="Sign in with Google" onClick={() => signIn('google')} last/>
			</>
		)
	}

	if (session) {
		inner = (
			<>
				<MenuButton text="Projects" icon={<RiProjector2Fill/>}/>
				<MenuButton text="Settings" icon={<MdSettings/>}/>
				<MenuButton text="Sign Out" icon={<IoExit/>} last onClick={() => signOut()}/>
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

	const defaultColor = themed('button')
	const activeColor = themed('buttonHovered')

  return (
		<Popover 
			matchWidth
			placement='bottom-end'
			isOpen={isOpen}
			gutter={0}
		>
			<PopoverTrigger>
				<Flex 
					backgroundColor={isOpen ? activeColor : defaultColor}
					borderEndRadius="1rem"
					borderBottomRightRadius={isOpen ? "":"1rem"}
					border="1px"
					borderColor={themed('border')}
					borderLeft="0px"
					userSelect="none"
					alignItems="center"
					cursor="pointer"
					onClick={togglePopover}
					maxH="2rem"
					transition="all 100ms ease"
					_hover={{
						backgroundColor: activeColor
					}}
				>
					<Text 
						px="1em"
						fontSize="0.9em"
						textOverflow="ellipsis"
					>
						{session?.user?.name ?? 'Sign In'}
					</Text>
					<Avatar 
						name={session?.user?.name ?? undefined}
						src={session?.user?.image ?? undefined}
						size="sm"
						transition="transform 100ms ease"
						transform={isOpen ? "scale(0.7)":"scale(0.9)"}
					/>
				</Flex>
			</PopoverTrigger>
			<Portal>
				<PopoverContent 
					width="100%"
					backgroundColor={themed('a1')}
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
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
	Spinner,
	useColorMode,
	Icon,
	Input,
	HStack,
	Stack
} from '@chakra-ui/react'
import React, { ReactElement, useState } from 'react'

import {useRouter} from 'next/router'
import {signIn, signOut, useSession} from 'next-auth/client'
import { Session } from 'next-auth';

import { RiProjector2Fill } from 'react-icons/ri'
import { MdSettings } from 'react-icons/md';
import { IoExit } from 'react-icons/io5'
import { themed } from '../theme/theme';
import { MdNightlight, MdWbSunny} from 'react-icons/md'
import { FaGithub, FaGoogle, FaTwitter } from 'react-icons/fa';
import { Divider } from './reusable/micro';

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
	isOpen: boolean
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
				<Stack p="0.5rem" pt="1rem">
					<Input type="text" placeholder="Username or Email"/>
					<Input type="password" placeholder="Password"/>
				</Stack>
				<HStack p="0.5rem" pb="1rem" justifyContent="center">
					<Button borderRadius="md" width="50%">Sign In</Button>
					<Button borderRadius="md" width="50%">Sign Up</Button>
				</HStack>
				<Divider/>
				<Stack p="0.5rem" py="1rem" sx={{border: "0"}}>
					<Button onClick={() => signIn('github')} bg="black" leftIcon={<FaGithub/>} color="white">Sign In With Github</Button>
					<Button onClick={() => signIn('google')} bg="#4588f1" leftIcon={<FaGoogle/>} color="white">Sign In With Google</Button>
					<Button onClick={() => signIn('twitter')} bg="#1DA1F2" leftIcon={<FaTwitter/>} color="white">Sign In With Twitter</Button>
				</Stack>
			</>
		)
	}

	if (session) {
		inner = (
			<Stack p="0.5rem" sx={{border: "0"}}>
				<MenuButton text="Projects" icon={<RiProjector2Fill/>}/>
				<MenuButton text="Settings" icon={<MdSettings/>}/>
				<MenuButton text="Sign Out" icon={<IoExit/>} onClick={() => signOut()}/>
			</Stack>
		)
	}

	return (
		<Flex 
			minW="fit-content"
			width="100%"
			direction="column" 
			borderRadius="0px"
			position="absolute"
			top="120%"
			right="0%"
			bg={themed('a1')}
			visibility={props.isOpen?'visible':'hidden'}
			border="1px"
			borderColor={themed('border')}
			shadow="xl"
		>
			{inner}
		</Flex>
	)
}

const NavUser = () => {

  const router = useRouter()
  const [session, loading] = useSession()

	const [isOpen, setIsOpen] = useState(false)

	const onClick = (ev) => {
		if(ev.target === ev.currentTarget) {
			setIsOpen(o => !o)
		}
	}

	const defaultColor = themed('button')
	const activeColor = themed('buttonHovered')

	const { colorMode, toggleColorMode } = useColorMode();

  return (
		<Flex 
        flex="1"
        alignItems={'center'} 
        justifyContent='center'
        marginLeft="auto"
        minW="min-content"
        px="1rem"
      >
        <Button 
          onClick={toggleColorMode} 
          size="sm"
          borderEndRadius={0}
        >
          <Icon as={colorMode==="light" ? MdWbSunny : MdNightlight}/>
        </Button>
				<Flex 
					backgroundColor={isOpen ? activeColor : defaultColor}
					borderEndRadius="1rem"
					border="1px"
					borderColor={themed('border')}
					borderLeft="0px"
					userSelect="none"
					alignItems="center"
					cursor="pointer"
					onClick={onClick}
					maxH="2rem"
					transition="all 100ms ease"
					_hover={{
						backgroundColor: activeColor
					}}
					position="relative"
				>
					<Text 
						px="1em"
						fontSize="0.9em"
						textOverflow="clip"
						whiteSpace="nowrap"
						pointerEvents="none"
					>
						{session?.user?.name ?? 'Sign In'}
					</Text>
					<Avatar 
						name={session?.user?.name ?? undefined}
						src={session?.user?.image ?? undefined}
						size="sm"
						transition="transform 100ms ease"
						transform={isOpen ? "scale(0.7)":"scale(0.9)"}
						pointerEvents="none"
					/>
					<UserMenu session={session ?? undefined} loading={loading} isOpen={isOpen}/>
				</Flex>
				
		</Flex>
  )
}

export default NavUser
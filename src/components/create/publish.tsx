import React from 'react'
import { 
	Flex,
	Button,
	Text,
	Input,
	Textarea,
	Divider,
} from '@chakra-ui/react'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { CgDetailsMore } from 'react-icons/cg'
import {FiHardDrive } from 'react-icons/fi'
import Head from 'next/head'


const ProjectPublishMenu = () => {
	return <Flex minW="20rem" flexDir="column" shadow="xl" sx={{fontSize: "sm"}}>
		<Flex flexDir="row" justifyContent="space-between" p="1rem">
			<Text w="8rem">
				Name
			</Text>
			<Input width="50%" size="sm" flex="1" placeholder="Project name">
			</Input>
		</Flex>
		<Flex flexDir="row" justifyContent="space-between" p="1rem" >
			<Text w="8rem">
				Description
			</Text>
			<Textarea flex="1" placeholder="Describe your project" size="xs"/>
		</Flex>
		<Flex flexDir="row" justifyContent="space-between" p="1rem">
			<Text w="8rem">
				Tags
			</Text>
			<Input width="50%" size="sm" flex="1" placeholder="Comma seperated tags i.e. raymarching, simulation, etc."/>
		</Flex>
		<Divider/>
		<Flex justifyContent="center" p="1rem" gridGap="1.5rem">
			<Button>
				Publish
			</Button>
			<Button>
				Save as Draft
			</Button>
		</Flex>
	</Flex>
}

export default ProjectPublishMenu
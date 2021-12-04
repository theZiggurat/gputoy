import React from 'react'
import { Panels, usePanels } from '../src/components/panels/panel'
import Scaffold from '../src/components/scaffold'

import descriptors from '../src/components/panels/descriptors'
import { _console } from '../src/recoil/console'
import { 
	Flex,
	Button,
	Text,
	useColorModeValue
} from '@chakra-ui/react'
import { RiArrowDropDownLine } from 'react-icons/ri'
import {FiHardDrive } from 'react-icons/fi'
import Head from 'next/head'
import ProjectManager from '../src/components/projectManager'

type ProjectHeaderProps = {
    title?: string,
}
const ProjectHeader = (props: ProjectHeaderProps) => {
	return (
		<Button 
			p="1rem" 
			paddingX="2rem"
		>
				<Text pr="1rem">
					{props.title ?? "Unnamed Project"}
				</Text>
				<FiHardDrive/>
		</Button>
	)
}

const Create = () => {

    const props = usePanels()
    
    return (
        <Scaffold navChildren={
            <ProjectHeader/>
        }>
            <Head>
                <title>{`GPUToy :: Unnamed Project`}</title>
            </Head>
            <ProjectManager/>
            <Panels {...props} descriptors={descriptors}/>
        </Scaffold>
    )
}

export default Create

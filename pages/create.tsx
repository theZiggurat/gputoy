import React, { useEffect } from 'react'
import { Panels } from '../src/components/panels/panel'
import { usePanels } from '../src/recoil/layout'
import descriptors from '../src/components/panels/descriptors'

import Scaffold from '../src/components/scaffold'

import { 
	Input,
} from '@chakra-ui/react'
import Head from 'next/head'

import ProjectManager from '../src/components/create/projectManager'
import ProjectMenu from '../src/components/create/menu'

import { RowButton } from '../src/components/reusable/rowButton'
import { MdOutlinePublish } from 'react-icons/md'
import { CgGitFork } from 'react-icons/cg'
import ProjectSerializer from '../src/components/create/projectSerializer'
import { useRecoilState, useRecoilValue } from 'recoil'
import { title, workingProjectID } from '../src/recoil/project'
import { GetServerSideProps } from 'next'
import { Project as ProjectDB } from '.prisma/client'
import prisma from '../lib/prisma'

export const getServerSideProps: GetServerSideProps = async ({query}) => {
	if (query.id !== undefined) {
		const project = await prisma.project.findUnique({
			where: {
				id: query.id
			},
			include: {
				shaders: true,
				author: {
						select: {
								name: true
						}
				}
		}
		})
		if (project !== null) {
			project.createdAt = project.createdAt.toISOString()
			project.updatedAt = project.updatedAt.toISOString()
			return { props: {
				project,
				projectID: query.id
			}}
		} else {
			return { props: { projectID: query.id } }
		}
 	}
	else 
		return { props: { projectID: 'local' } }
	
}

const ProjectHeader = () => {

	const projectID = useRecoilValue(workingProjectID)
	const [projectTitle, setProjectTitle] = useRecoilState(title(projectID))

	const onTitleChange = (ev) => setProjectTitle(ev.target.value)

	return (
		<>
		<ProjectMenu/>
		<Input 
			maxWidth="15rem" 
			borderLeft="0" 
			placeholder="Unnamed Project" 
			value={projectTitle} 
			onChange={onTitleChange}
		/>
		<RowButton 
			purpose="Fork"
			icon={<CgGitFork size={17}/>}
		/>
		<RowButton 
			purpose="Publish"
			icon={<MdOutlinePublish size={17}/>}
			last
		/>
		</>
	)
}

const Create = (props: {projectID: string, project?: ProjectDB}) => {

	const panelProps = usePanels()

	return (
		<Scaffold navChildren={
			<ProjectHeader/>
		}>
			{/* <Head>
				<title>{`GPUToy :: Unnamed Project`}</title>
			</Head> */}
			<ProjectManager/>
			<ProjectSerializer {...props}/>
			<Panels {...panelProps} descriptors={descriptors}/>
		</Scaffold>
	)
}

export default Create

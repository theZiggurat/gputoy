import React, { useEffect } from 'react'
import { Panels } from '../src/components/panels/panel'
import { usePanels } from '../src/recoil/layout'
import descriptors from '../src/components/panels/descriptors'

import Scaffold from '../src/components/scaffold'

import ProjectManager from '../src/components/create/projectManager'
import ProjectMenu from '../src/components/create/menu'

import ProjectSerializer from '../src/components/create/projectSerializer'
import { GetServerSideProps } from 'next'
import { Project as ProjectDB } from '.prisma/client'
import prisma from '../lib/prisma'
import Head from 'next/head'

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

const Create = (props: {projectID: string, project?: ProjectDB}) => {

	const panelProps = usePanels({})

	return (
		<>
			<Head>
				<title>{props.project?.title ?? 'Unnamed Project'}</title>
			</Head>
			<Scaffold navChildren={
				<ProjectMenu/>
			}>
				{/* <Head>
					<title>{`GPUToy :: Unnamed Project`}</title>
				</Head> */}
				<ProjectManager/>
				<ProjectSerializer {...props}/>
				<Panels {...panelProps} descriptors={descriptors}/>
			</Scaffold>
		</>
	)
}

export default Create

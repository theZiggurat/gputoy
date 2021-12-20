import { Project as ProjectDB } from '.prisma/client'
import usePanels from '@recoil/hooks/usePanels'
import useProjectManager from '@recoil/hooks/useProjectManager'
import useProjectStorage from '@recoil/hooks/useProjectStorage'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'
import prisma from '../lib/prisma'
import ProjectMenu from '../src/components/create/menu'
import descriptors from '../src/components/panels/descriptors'
import { Panels } from '../src/components/panels/panel'
import Scaffold from '../src/components/shared/scaffold'




export const getServerSideProps: GetServerSideProps = async ({ query }) => {
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
			return {
				props: {
					project,
					projectID: query.id
				}
			}
		} else {
			return { props: { projectID: query.id } }
		}
	}
	else
		return { props: { projectID: 'local' } }

}

const CreateManager = (props: { projectID: string, project?: ProjectDB }) => {

	useProjectStorage(props)
	useProjectManager(props)

	return <></>
}

const Create = (props: { projectID: string, project?: ProjectDB }) => {

	const panelProps = usePanels({})

	return (
		<>
			<Head>
				<title>{props.project?.title ?? 'Unnamed Project'}</title>
			</Head>
			<Scaffold navChildren={
				<ProjectMenu />
			}>
				<CreateManager {...props} />
				<Panels {...panelProps} descriptors={descriptors} />
			</Scaffold>
		</>
	)
}

export default Create

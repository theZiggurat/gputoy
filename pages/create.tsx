import { Project as ProjectDB } from '.prisma/client'
import { chakra, useColorModeValue } from '@chakra-ui/react'
import usePanels from '@recoil/hooks/usePanels'
import useProjectManager from '@recoil/hooks/useProjectManager'
import useProjectStorage from '@recoil/hooks/useProjectStorage'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'
import { lightResizer, darkResizer } from 'theme/consts'
import prisma from '@database/prisma'
import descriptors from '../src/components/panels/descriptors'
import { Panels } from '../src/components/panels/panel'
import Nav from '@components/create/navbar'
import { scrollbarHidden } from 'theme/consts'
import { nanoid } from 'nanoid'
import { CreatePageProjectQuery, createPageProjectQuery } from '@database/args'


export const getServerSideProps: GetServerSideProps = async ({ query }) => {

	const id = query.id as string

	// new project
	if (id === undefined) {
		return { props: { projectID: 'local_' + nanoid(8) } }
	}

	// load from local storage
	if (id.startsWith('local')) {
		return { props: { projectID: id } }
	}

	// load from database
	const project = await prisma.project.findUnique({
		...createPageProjectQuery,
		where: {
			id: id
		}
	})

	console.log('result from database', project)

	// project not found
	if (project == null) return { notFound: true }

	//project.createdAt = project.createdAt.toISOString()
	//project.updatedAt = project.updatedAt.toISOString()

	return {
		props: {
			project,
			projectID: id
		}
	}


}

const CreateManager = (props: { projectID: string, project?: CreatePageProjectQuery }) => {

	useProjectStorage(props)
	useProjectManager(props)

	return <></>
}

const Create = (props: { projectID: string, project?: CreatePageProjectQuery }) => {

	const panelProps = usePanels({})

	return (
		<>
			<Head>
				<title>{props.project?.title ?? 'Unnamed Project'}</title>
			</Head>
			<chakra.main
				display="flex"
				flexFlow="column"
				width="100%"
				height="100%"
				maxHeight="100%"
				overflow="hidden"
				sx={useColorModeValue(lightResizer, darkResizer)}
				css={scrollbarHidden}
			>
				<CreateManager {...props} />
				<Nav />
				<Panels {...panelProps} descriptors={descriptors} />
			</chakra.main>
		</>


	)
}

export default Create

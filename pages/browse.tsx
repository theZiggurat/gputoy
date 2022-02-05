import { Project } from '.prisma/client'
import {
	Box, Flex, Grid,
	GridItem, Input
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React from 'react'
import prisma from 'core/backend/prisma'
import ProjectCard from '@components/shared/projectCard'
import Scaffold from '@components/shared/scaffold'
import { themed } from '@theme/theme'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const projects = await prisma.project.findMany({
		where: {
			published: true
		},
		take: 12,
		include: {
			shaders: true,
			author: {
				select: {
					name: true
				}
			}
		}
	})
	projects.forEach(p => {
		p.createdAt = p.createdAt.toISOString()
		p.updatedAt = p.updatedAt.toISOString()
	})
	return {
		props: {
			projects: projects
		},
	};
}

const Browse = (props: { projects: Project[] }) => {

	const { projects } = props

	return (
		<>
			<Head>
				<title>Browse Projects</title>
			</Head>
			<Scaffold>
				<Box
					bg={themed('p')}
					height="100%"
					overflowY="scroll"
				>
					<Flex
						justifyContent="center"
						p="2rem"
					>
						<Input type="search" ml="6rem" mr="2rem">
						</Input>
						<Input type="date" mr="6rem">
						</Input>
					</Flex>
					<Grid

						bg={themed('bg')}
						position="relative"
						templateRows='repeat(6, 1fr)'
						templateColumns='repeat(3, 1fr)'
						height="250%"
						gap="1rem"
						px="20rem"
						py="8rem"
					>
						{
							projects.map((p: Project, idx: number) => {
								return (
									<GridItem
										key={p.id}
										rowSpan={idx == 0 || idx == 7 ? 2 : 1}
										colSpan={idx == 0 || idx == 7 ? 2 : 1}
										cursor="pointer"
									>
										<ProjectCard project={p} bg />
									</GridItem>
								)
							})
						}
					</Grid>
					<Flex justifyContent="center" mt="2rem">
						Test
					</Flex>
				</Box>
			</Scaffold>
		</>
	)
}

export default Browse;




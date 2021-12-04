import React from 'react'
import { 
    Box,
    Grid,
    GridItem,
    Flex,
    Input,
		useColorModeValue
} from '@chakra-ui/react'
import Scaffold from '../src/components/scaffold'
import { Project } from '.prisma/client'
import ProjectCard from '../src/components/reusable/projectCard'
import prisma from '../lib/prisma'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    const projects = await prisma.project.findMany({
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

const Browse = (props: {projects: Project[]}) => {

    const { projects } = props

    return (
			<Scaffold>
				<Box 
					p="8rem" 
					bg={useColorModeValue("light.p", 'dark.bg')}  
					height="100%" 
					overflowY="scroll"
				>
					<Flex justifyContent="center" mb="2rem">
							<Input type="search">
							</Input>
							<Input type="date">
							</Input>
					</Flex>
					<Grid 
						position="relative"
						templateRows='repeat(6, 1fr)'
						templateColumns='repeat(3, 1fr)' 
						height="300%" 
						gap="3rem"
				>
						{
							projects.map((p: Project, idx: number) => {
								return (
									<GridItem 
										rowSpan={idx == 0 || idx == 7 ? 2 : 1} 
										colSpan={idx == 0 || idx == 7 ? 2 : 1}
										cursor="pointer"
									>
										<ProjectCard project={p} />
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
    )
}

export default Browse;




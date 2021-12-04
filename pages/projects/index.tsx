import { Box, Center, Flex, HStack, Text, Badge, Button, Image, Spinner } from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import React, { useEffect } from 'react'
import prisma from '../../lib/prisma'
import Scaffold from '../../src/components/scaffold'
import { Project } from '.prisma/client'
import { Project as GPUProject} from '../../src/gpu/project'
import Link from 'next/link'
import { useResetRecoilState } from 'recoil'

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  const session = await getSession({req})
  if (!session) {
    res.statusCode = 403;
    return { props: { projects: null } };
  }
  const projects = await prisma.project.findMany({
    where: {
      authorId: session.user?.id
    },
    include: {
      shaders: true
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

const ProjectCard = (props: {project: Project, imgsrc?: string}) => {
  const { project, imgsrc } = props

  return (
    <Link href='projects/[id]' as={`projects/${project.id}`}>
      <Box backgroundColor="gray.700" width="300px" shadow='md' borderRadius="20px" m={3} cursor="pointer" _hover={{
        shadow: 'dark-lg',
      }}
      style={{
        transition: 'box-shadow 0.2s ease-in-out'
      }}
    >
        {
          imgsrc && <Image src={imgsrc} width="300px" height="200px" borderTopRadius="20px"/>
        }
        {
          !imgsrc && <Center width="300px" height="200px">
            <Spinner/>
          </Center>
        }
        
        <Flex direction="column" p={5}>
          <Text fontSize="xx-large" fontWeight="bold">{project.title}</Text>
          <HStack mb={3}>
            <Badge borderRadius="10%" colorScheme="teal">New</Badge>
            <Badge borderRadius="10%" colorScheme="teal">Easy</Badge>
          </HStack>
          <Text fontSize="sm">{project.description}</Text>
          <Flex>
              {/* {Date.parse(project.)} */}
          </Flex>
        </Flex>
      </Box>
    </Link>
  )
}

const Project = (props: {projects: Project[] | null}) => {

  const { projects } = props

  const [imgs, setImgs] = React.useState([])

  const generatePreviews = async () => {
    await GPUProject.instance().attachCanvas('offscreen')
    const srcs = projects.map(async p => {
      return await GPUProject.instance().renderPreview(p) ?? ""
    })
    setImgs(await Promise.all(srcs))
  }
  
  useEffect(() => {
    if (projects != null)
      generatePreviews()
  }, [])

  let inner
  if (props.projects === null) {
    inner = (
      <Center width="100%" height="100%">
        Sign in to save projects
      </Center>
    )
  } else if(props.projects.length == 0) {
    inner = (
      <Center width="100%" height="100%" flexDirection="column">
        You have not saved any projects yet
        <Link href='/create/'>
          <Button>
            Create one now!
          </Button>
        </Link>
      </Center>
    )
  } else {
    inner = (
      <Center width="100%" height="100%">
        <canvas id='offscreen' width="300px" height="200px" style={{
          position: 'absolute',
          visibility: 'hidden'
        }}/>
        {
          projects.map((p, idx) => {
            return <ProjectCard project={p} imgsrc={imgs[idx]}/>
          })
        }
      </Center>
    )
  }

  return <Scaffold>
    {inner}
  </Scaffold>
}

export default Project
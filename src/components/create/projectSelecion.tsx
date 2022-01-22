import React, { useEffect, useState } from "react"
import { Modal } from '@components/shared/modal'
import { Box, Flex, Text, Grid, HStack, Avatar, Center, Spinner, useColorModeValue, Input, Button, IconButton } from '@chakra-ui/react'
import { themed } from "theme/theme"
import { CreatePageProjectQueryWithId } from "@database/args"
import { useProjectDirect } from "@gpu/projectDirect"
import prisma from "@database/prisma"
import { session, useSession } from "next-auth/client"
import { Session } from "next-auth"
import Link from 'next/link'
import { FiHardDrive, FiMoreVertical } from 'react-icons/fi'
import { BsCloudArrowUp, BsCloudCheck } from "react-icons/bs"
import { useSetRecoilState } from "recoil"
import { projectLastSaveLocal } from "@recoil/project"
import { nanoid } from "nanoid"
import { useRouter } from "next/router"
import useFork from "@recoil/hooks/project/useFork"
import NavUser from "@components/shared/user"
import generate from "project-name-generator"
import { MdPublishedWithChanges, MdCheck } from 'react-icons/md'

type ProjectInfo = {
  id: string,
  title: string,
  updatedAt: string,
  type: number
}

const projectAccessModeIcon = [
  <FiHardDrive key="0" title="Saved to local storage" />,
  <BsCloudCheck key="1" title="Saved to account" />,
  <BsCloudArrowUp key="2" title="Saved to account with local changes" />,
  <MdCheck key="3" title="Published" />,
  <MdPublishedWithChanges key="4" title="Published with local changes" />
]

const foldProjectArrays = (local: ProjectInfo[], remote: ProjectInfo[]) => {
  const localChangesSet = local.filter(i1 => remote.find(i2 => i1.id === i2.id)).map(i => { return { ...i, type: i.type + 1 } as ProjectInfo })
  const localChangesIds = localChangesSet.map(i => i.id)
  const localFiltered = local.filter(i => !localChangesIds.includes(i.id))
  const remoteFiltered = remote.filter(i => !localChangesIds.includes(i.id))

  return localChangesSet.concat(localFiltered).concat(remoteFiltered).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

const ProjectDrawer = () => {

  const [localProjects, setLocalProjects] = useState<ProjectInfo[]>([])
  const [remoteProjects, setRemoteProjects] = useState<ProjectInfo[]>([])

  const allProjects = foldProjectArrays(localProjects, remoteProjects)

  /**
   * load projects from session
   */
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/myprojects', {
        method: "GET",
      })
      const projects = await res.json()
      setRemoteProjects(projects.map(p => ({ ...p, type: p.published ? 3 : 1 })))
    }
    fetchProjects()
  }, [])

  /**
   * load projects from storage
   */
  useEffect(() => {
    const localProj: ProjectInfo[] = []
    for (let key in localStorage) {
      if (key.startsWith('project')) {
        const project = JSON.parse(localStorage.getItem(key)!)
        localProj.push({
          id: key.match(/(?<=project_local_).*/gm)![0],
          title: project.title,
          updatedAt: project.updatedAt,
          type: 0
        })
      }
    }
    setLocalProjects(localProj)
  }, [])

  return (
    <Flex
      flexDir="column"
      borderRight="1px"
      borderColor={themed('border')}
    >
      <Box
        bg={themed('a2')}
        borderBottom="1px"
        borderColor={themed('borderLight')}
        color={themed('textMidLight')}
        fontWeight="bold"
        fontSize="sm"
        p="0.5rem"
        pl="1rem"
      >
        Recent Projects
      </Box>
      <Flex
        w="20rem"
        flexDir="column"
      >
        {
          allProjects.map(p => (
            <Link href={`/create/${p.id}`} passHref key={p.id}>
              <Flex
                justifyContent="space-between"
                w="100%"
                borderBottom="1px"
                borderColor={themed('borderLight')}
                p="0.5rem"
                pl="1rem"
                fontSize="sm"
                transition="background-color 0.2s ease"
                cursor="pointer"
                _hover={{
                  bg: themed('inputHovered')
                }}
              >
                <Text fontWeight="bold" color={themed('textMid')}>
                  {p.title}
                </Text>
                <HStack sx={{ color: themed('textLight'), fontSize: 'lg' }}>
                  <Text fontSize="xs">
                  </Text>
                  {projectAccessModeIcon[p.type]}
                </HStack>
              </Flex>
            </Link>
          ))
        }
      </Flex>
    </Flex>

  )
}

const ProjectTemplates = (props: { templates: CreatePageProjectQueryWithId[] }) => {

  const fork = useFork()
  const onClickProjectTemplate = (idx: number) => fork(props.templates[idx], { title: generate().dashed })

  return (
    <Flex flexDir="column">
      <Flex
        borderBottom="1px"
        borderColor={themed('borderLight')}
        color={themed('textMidLight')}
        bg={themed('a2')}
        fontWeight="bold"
        fontSize="sm"
        p="0.5rem"
        pl="1rem"
        justifyContent="space-between"
      >
        <Text>
          Templates
        </Text>
        <Input size="xs" maxW="50%" h="1.3rem">

        </Input>
      </Flex>
      <Grid templateColumns="repeat(3, 1fr)" p="1rem" gridGap="1rem" maxH="600px" overflowY="scroll">
        {
          props.templates.map((p, idx) =>
            <ProjectTemplate key={p.title} project={p} idx={idx} onClickProjectTemplate={onClickProjectTemplate} />
          )
        }
      </Grid>
    </Flex>
  )
}

type ProjectTemplateProps = {
  project: CreatePageProjectQueryWithId,
  onClickProjectTemplate: (idx: number) => void,
  idx: number
}
const ProjectTemplate = (props: ProjectTemplateProps) => {

  const { project } = props

  const [loading, setPlaying] = useProjectDirect(project, false, project.id, `${project.id}_bg`)
  const textBg = useColorModeValue("light.bg", 'dark.bg')

  const onHandleHover = () => {
    setPlaying(true)
  }
  const onHandleLeave = () => {
    setPlaying(false)
  }

  const handleClickProjectTemplate = () => {
    props.onClickProjectTemplate(props.idx)
  }

  return (
    <Box
      onClick={handleClickProjectTemplate}
      width="15rem"
      height="15rem"
      position="relative"
      onMouseEnter={onHandleHover}
      onMouseLeave={onHandleLeave}
      className="group"
      transition="transform 0.2s ease"
      cursor="pointer"
      _hover={{
        transform: 'scale(1.03)'
      }}
    >
      {
        loading &&
        <Center width='100%' height='100%' position='absolute'>
          <Spinner zIndex={5}></Spinner>
        </Center>
      }
      <Box
        pos="absolute"
        zIndex={1}
        left="-1px"
        top="-1px"
        p="1rem"
        w="101%"
        bg={themed('bgVisible')}
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={themed('textMidLight')}
        >
          {project.title}
        </Text>
        <Text
          fontSize="sm"

          color={themed('textMidLight')}
        >
          {project.description}
        </Text>
      </Box>

      <canvas
        id={project.id}
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          visibility: loading ? 'hidden' : 'visible',
          opacity: loading ? 0 : 1,
          transition: 'opacity 1.0s ease',
          pointerEvents: 'none',
        }}
      />

    </Box>
  )
}

const ProjectSelection = (props: { templates: CreatePageProjectQueryWithId[] }) => {

  const [session, loading] = useSession()

  return (
    <Modal onRequestClose={() => { }} isOpen>
      <Flex
        bg={themed('p')}
        flexDir="column"
        border="2px"
        borderColor={themed('borderLight')}
      >
        <Flex
          p="1rem"
          bg={themed('bg')}
          borderBottom="1px"
          borderColor={themed('border')}
          justifyContent="space-between"
        >
          <Text
            fontSize="xx-large"
            fontWeight="bold"
            color={themed('textMidLight')}
          >
            Select Project
          </Text>
          <HStack>
            {
              session &&
              <>
                <Text fontWeight="light" color={themed('textLight')}>
                  Welcome, {session?.user?.name}
                </Text>
                <Avatar size="sm" src={session?.user?.image ?? undefined} />
              </>
            }
            {
              !session &&
              <NavUser />
            }

          </HStack>
        </Flex>
        <Flex flexDir="row">
          <ProjectDrawer />
          <ProjectTemplates {...props} />
        </Flex>
      </Flex>
    </Modal>
  )
}

export default ProjectSelection

function generated() {
  throw new Error("Function not implemented.")
}

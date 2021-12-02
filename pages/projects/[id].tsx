import { GetServerSideProps } from "next"
import React from "react"
import prisma from "../../lib/prisma"
import descriptors from "../../src/components/panels/descriptors"
import ViewportPanel from "../../src/components/panels/impls/viewPanel"
import { Panels, usePanels } from "../../src/components/panels/panel"
import Scaffold from "../../src/components/scaffold"
import { setSkipStorage } from "../../src/recoil/effects"
import { setProjectStateFromDBValue } from "../../src/recoil/project"
import { Flex, Divider, Text } from '@chakra-ui/react'
import { AiOutlineCloudServer } from "react-icons/ai"
import { RiArrowDropDownLine } from "react-icons/ri"
import Head from "next/head"

export const getServerSideProps: GetServerSideProps = async (context) => {
  
  const project = await prisma.project.findUnique({
    where: {
      id: context.params.id
    },
    include: {
      shaders: true
    }
  })
  if (project === null) {
    return { notFound: true }
  }
  project.createdAt = project.createdAt.toISOString()
  project.updatedAt = project.updatedAt.toISOString()

  return {
    props: { project }
  }
}

type ProjectHeaderProps = {
  title?: string,
  forked?: boolean
}
const ProjectHeader = (props: ProjectHeaderProps) => {
  return (
      <Flex bg="whiteAlpha.100" p={2} paddingX={3} fontSize="sm" fontWeight="bold" borderRadius="md" justifyItems="center">
          <Text pr={2}>{props.title ?? "Unnamed Project"}</Text>
          <AiOutlineCloudServer size={20}/>
          <Divider orientation="vertical"/>
          <RiArrowDropDownLine size={20}/>
      </Flex>
  )
}

const ProjectViewer = (props) => {

  setSkipStorage(true)
  setProjectStateFromDBValue(props.project)
  const panelProps = usePanels()

  return <Scaffold navChildren={<ProjectHeader title={props.project.title}/>}>
    <Head>
      <title>{`GPUToy :: ${props.project.title}`}</title>
    </Head>
    <Panels {...panelProps} descriptors={descriptors}/>
  </Scaffold>
}

export default ProjectViewer
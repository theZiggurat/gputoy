import { Project as ProjectDB } from '.prisma/client'
import { chakra, useColorModeValue } from '@chakra-ui/react'
import usePanels from '@recoil/hooks/usePanels'
import useProjectManager from '@recoil/hooks/useProjectManager'
import useProjectStorage from '@recoil/hooks/useProjectStorage'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useEffect } from 'react'
import { lightResizer, darkResizer } from 'theme/consts'
import prisma from '@database/prisma'
import descriptors from '@components/panels/descriptors'
import { Panels } from '@components/panels/panel'
import Nav from '@components/create/navbar'
import { scrollbarHidden } from 'theme/consts'
import { nanoid } from 'nanoid'
import { CreatePageProjectQuery, createPageProjectQuery, createPageProjectSaveHistory, CreatePageProjectSaveHistorySer } from '@database/args'
import RecoilDebugPanel from '@components/create/debug'
import { useSession } from 'next-auth/client'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { currentProjectIDAtom } from '@recoil/project'
import KeybindManager from '@components/create/keybinds'

type CreatePageProps = {
  projectId: string,
  project?: CreatePageProjectQuery | null,
  dateInfo: CreatePageProjectSaveHistorySer | null
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {

  const id = query.pid as string

  const project = await prisma.project.findUnique({
    ...createPageProjectQuery,
    where: {
      id: id
    }
  })

  const dateInfo = await prisma.project.findUnique({
    ...createPageProjectSaveHistory,
    where: {
      id: id
    }
  })

  return {
    props: {
      projectId: id,
      project,
      dateInfo: dateInfo == null ?
        null : {
          updatedAt: dateInfo?.updatedAt?.toISOString() ?? "",
          createdAt: dateInfo?.createdAt?.toISOString() ?? ""
        }
    }
  }
}

const ScopedProjectManager = (props: CreatePageProps) => {

  const [session, loading] = useSession()

  useProjectStorage({ session, projectFromDB: props.project, dateInfo: props.dateInfo })
  useProjectManager()

  return <></>
}

const Create = (props: CreatePageProps) => {

  const panelProps = usePanels({})
  const setProjectId = useSetRecoilState(currentProjectIDAtom)

  useEffect(() => {
    setProjectId(props.projectId)
  }, [props.projectId, setProjectId])

  return (
    <>
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

        <RecoilDebugPanel />
        <ScopedProjectManager {...props} />
        <KeybindManager />

        <Nav />
        <Panels {...panelProps} descriptors={descriptors} />
      </chakra.main>
    </>


  )
}

export default Create

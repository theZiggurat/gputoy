import { chakra, useColorModeValue } from '@chakra-ui/react'
import usePanels from '@core/hooks/singleton/usePanels'
import useProjectManager from '@core/hooks/singleton/useProjectManager'
import useProjectStorage from '@core/hooks/singleton/useProjectStorage'
import { GetServerSideProps } from 'next'
import React, { useEffect } from 'react'
import { lightResizer, darkResizer } from 'theme/consts'
import prisma from 'core/backend/prisma'
import descriptors from '@components/panels/descriptors'
import { Panels } from '@components/panels/panel'
import Nav from '@components/create/navbar'
import { scrollbarHidden } from 'theme/consts'
import { ProjectQuery, projectQuery, projectSaveHistory, ProjectSaveHistorySerialized } from 'core/types'
import { useSession } from 'next-auth/client'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { currentProjectIdAtom, projectTitleAtom } from 'core/recoil/atoms/project'
import KeybindManager from '@components/create/keybinds'
import RecoilDebugPanel from '@components/create/debug'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTaskCoordinator } from '@core/hooks/useTask'
import useLogger from '@core/hooks/useLogger'

type CreatePageProps = {
  projectId: string,
  project?: ProjectQuery | null,
  dateInfo: ProjectSaveHistorySerialized | null
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

  const id = params.pid as string
  const project = await prisma.project.findUnique({
    ...projectQuery,
    where: {
      id: id
    }
  })

  const dateInfo = await prisma.project.findUnique({
    ...projectSaveHistory,
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

const EditorTitle = () => {
  const title = useRecoilValue(projectTitleAtom)
  return <Head>
    <title>{title != null && title.length > 0 ? title : "Editor"}</title>
  </Head>
}

const ScopedProjectManager = (props: CreatePageProps) => {

  const [session, loading] = useSession()

  useProjectStorage({ session, projectFromDB: props.project ?? undefined, dateInfo: props.dateInfo })
  useProjectManager()

  return <></>
}

const UITaskCoordinator = () => {
  const logger = useLogger()
  useTaskCoordinator(logger)

  return <></>
}

const Create = (props: CreatePageProps) => {

  const router = useRouter()

  const panelProps = usePanels({})
  const setProjectId = useSetRecoilState(currentProjectIdAtom)

  useEffect(() => {
    setProjectId(props.projectId)
  }, [props.projectId, setProjectId])

  return (
    <>
      <EditorTitle />
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
        <UITaskCoordinator />
        <KeybindManager />

        <Nav />
        <Panels {...panelProps} descriptors={descriptors} />
      </chakra.main>
    </>


  )
}

export default Create

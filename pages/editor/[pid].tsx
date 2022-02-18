import { chakra, useColorModeValue } from '@chakra-ui/react'
import usePanels from '@core/hooks/usePanels'
import useProjectManager from '@core/hooks/useProjectManager'
import useProjectStorage from '@core/hooks/useProjectStorage'
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next'
import React, { useEffect } from 'react'
import { lightResizer, darkResizer } from 'theme/consts'
import prisma from 'core/backend/prisma'
import descriptors from '@components/panels/descriptors'
import { Panels } from '@components/panels/panel'
import Nav from '@components/create/navbar'
import { scrollbarHidden } from 'theme/consts'
import { CreatePageProjectQuery, createPageProjectQuery, createPageProjectSaveHistory, CreatePageProjectSaveHistorySer } from 'core/types/queries'
import { useSession } from 'next-auth/client'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { currentProjectIdAtom, projectTitleAtom } from 'core/recoil/atoms/project'
import KeybindManager from '@components/create/keybinds'
import RecoilDebugPanel from '@components/create/debug'
import Head from 'next/head'
import { useRouter } from 'next/router'

type CreatePageProps = {
  projectId: string,
  project?: CreatePageProjectQuery | null,
  dateInfo: CreatePageProjectSaveHistorySer | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const query = await prisma.project.findMany({
    select: {
      id: true
    },
    where: {
      template: true
    }
  })
  const paths = query.map(q => ({ params: { pid: q.id } }))

  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const id = params.pid as string

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

  const ret = {
    projectId: id,
    project,
    dateInfo: dateInfo == null ?
      null : {
        updatedAt: dateInfo?.updatedAt?.toISOString() ?? "",
        createdAt: dateInfo?.createdAt?.toISOString() ?? ""
      }
  }
  return {
    props: ret
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

  useProjectStorage({ session, projectFromDB: props.project, dateInfo: props.dateInfo })
  useProjectManager()

  return <></>
}

const Create = (props: CreatePageProps) => {

  const router = useRouter()

  const panelProps = usePanels({})
  const setProjectId = useSetRecoilState(currentProjectIdAtom)

  useEffect(() => {
    setProjectId(props.projectId)
  }, [props.projectId, setProjectId])

  useEffect(() => {
    console.log('FALLBACK?: ', router.isFallback)
  }, [router])

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
        <KeybindManager />

        <Nav />
        <Panels {...panelProps} descriptors={descriptors} />
      </chakra.main>
    </>


  )
}

export default Create

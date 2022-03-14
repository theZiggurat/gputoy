import { chakra, useColorModeValue } from '@chakra-ui/react'
import usePanels from '@core/hooks/singleton/usePanels'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import React from 'react'
import { lightResizer, darkResizer } from 'theme/consts'
import prisma from 'core/backend/prisma'
import descriptors from '@components/panels/descriptors'
import { Panels } from '@components/panels/panel'
import Nav from '@components/create/navbar'
import { scrollbarHidden } from 'theme/consts'
import { ProjectQuery, projectQuery } from '@core/types'
import ProjectSelection from '@components/create/projectSelecion'

export const getStaticProps: GetStaticProps = async ({ req, res }) => {
  const templates = await prisma.project.findMany({
    ...projectQuery,
    where: {
      template: true,
    }
  })
  return {
    props: {
      templates
    }
  }
}

const Create = (props: { templates: ProjectQuery[] }) => {

  const panelProps = usePanels({})

  return (
    <>
      <Head>
        <title>Choose Project</title>
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
        <ProjectSelection {...props} />
        <Nav />
        <Panels {...panelProps} descriptors={descriptors} />
      </chakra.main>
    </>


  )
}

export default Create

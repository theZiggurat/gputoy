import React, { useEffect, useState } from 'react'


import ProjectManager from '../src/components/create/projectManager'

import ProjectSerializer from '../src/components/create/projectSerializer'
import { GetServerSideProps } from 'next'
import { Project as ProjectDB } from '.prisma/client'
import prisma from '../lib/prisma'
import { Box } from '@chakra-ui/react'
import ViewportEmbeddable from '../src/components/panels/embeds/viewport'
import EditorEmbedable from '../src/components/panels/embeds/editor'
import SplitPane from 'react-split-pane'

export const getServerSideProps: GetServerSideProps = async ({query}) => {
	if (query.id !== undefined) {
		const project = await prisma.project.findUnique({
			where: {
				id: query.id
			},
			include: {
				shaders: true,
				author: {
						select: {
								name: true
						}
				}
		}
		})
		if (project !== null) {
			project.createdAt = project.createdAt.toISOString()
			project.updatedAt = project.updatedAt.toISOString()
			return { props: {
				project,
				projectID: query.id,
        mode: query.theme ?? 'light'
			}}
		} 
 	}
	else 
		return { props: { projectID: 'not_found', mode: query.theme ?? 'light' } }
	
}

const resizerStyle = {
  ".Resizer": {
    zIndex: 1,
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    boxSizing: "border-box",
    MozBackgroundClip: "padding",
    WebkitBackgroundClip: "padding",
    backgroundClip: "padding-box",
    position: "relative",
    width: "20px"
  },
  ".Resizer:hover": {
    WebkitTransition: "all 2s ease",
    transition: "all 2s ease"
  },
}

const resizerDark = {
  ".Resizer.vertical": {
    width: "11px",
    margin: "0 -5px",
    borderLeft: "10px solid #292929",
    borderRight: "10px solid #292929",
    cursor: "col-resize"
  },
  ".Resizer::before": {
    content: '""',
    position: 'absolute',
    width: "5px",
    height: "30%",
    top: "35%",
    left: "-3px",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: "50px",
  },
}

const resizerLight = {
  ".Resizer.vertical": {
    width: "11px",
    margin: "0 -5px",
    borderLeft: "10px solid #D0D0D0",
    borderRight: "10px solid #D0D0D0",
    cursor: "col-resize"
  },
  ".Resizer::before": {
    content: '""',
    position: 'absolute',
    width: "5px",
    height: "30%",
    top: "35%",
    left: "-3px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: "50px",
  },
}

const Embeddable = (props: {projectID: string, project?: ProjectDB, mode: 'light'|'dark'}) => {

  const [maxWidth, setMaxWidth] = useState(10000)

  useEffect(() => {
    setMaxWidth(window.innerWidth - 14)
  }, [])

  const resizeTheme = props.mode == 'light' ? resizerLight : resizerDark

	return (
    <Box sx={{...resizerStyle, ...resizeTheme}}>
      <ProjectManager/>
      <ProjectSerializer {...props}/>
      <SplitPane 
        split="vertical" 
        minSize={5}
        maxSize={maxWidth}
        size={400}
        pane2Style={{
          minWidth: '50%'
        }}
      >
        <EditorEmbedable/>
        <ViewportEmbeddable/>
      </SplitPane>
    </Box>
	)
}

export default Embeddable

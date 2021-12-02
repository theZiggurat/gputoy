import { Project } from ".prisma/client"
import React, { useRef, useState, useEffect } from "react"
import ProjectDirect from "../../gpu/projectDirect"
import { useProjectControlsDirect } from "../../recoil/controls"
import { 
  Text, 
  Box,
  Center,
  Spinner
} from '@chakra-ui/react'

const ProjectCard = (props: {project: Project}) => {

  const { project } = props

  const projectRef = useRef<ProjectDirect | undefined>(undefined)
  const controls = useProjectControlsDirect(projectRef)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(false)
  const animationHandle = useRef(0)

  useEffect(() => {
      const init = async () => {
          projectRef.current = new ProjectDirect()
          await projectRef.current.init(project)
          setLoading(false)
      }
      init()
  }, [])

  const render = () => {
    controls.step()
    projectRef.current?.renderFrame()
    animationHandle.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    if (!loading) {
      if (hovered) {
        controls.play()
        animationHandle.current = requestAnimationFrame(render)
      } else {
        controls.pause()
      }
    }
    return () => cancelAnimationFrame(animationHandle.current)
  }, [hovered])

  const onHandleHover = () => setHovered(true)
  const onHandleLeave = () => setHovered(false)

  return (
    <Box 
      width="100%" 
      height="100%" 
      position="relative"
      onMouseEnter={onHandleHover}
      onMouseLeave={onHandleLeave}
    >
      {
        loading &&
        <Center width='100%' height='100%' position='absolute'>
            <Spinner zIndex={5}></Spinner>
        </Center>
      }
      <canvas
        id={project.id}
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 0,
          backgroundColor: 'red',
          visibility: loading ? 'hidden':'visible',
          opacity: loading ? 0:1,
          transition: 'opacity 1.0s ease'
        }}
      />
      <Text 
        position="relative" 
        display="block" 
        width="fit-content" 
        bg="gray.1000" 
        p="0.7rem" 
        pt="0rem"
        fontSize="xx-large" 
        fontFamily="'JetBrains Mono'" 
        zIndex={2}
      >
        {props.project?.title ?? "Placeholder"}
      </Text>
      <Text 
        position="relative" 
        display="inline" 
        bg="gray.1000" 
        p="0.5rem" 
        fontSize="med" 
        fontFamily="'JetBrains Mono'" 
        zIndex={2}
      >
        {props.project?.author?.name ?? "Placeholder Author"}
      </Text>
    </Box>
  )
}

export default ProjectCard
import { Project } from ".prisma/client"
import React, { useRef, useState, useEffect } from "react"
import ProjectDirect from "../../gpu/projectDirect"
import { useProjectControlsDirect } from "../../recoil/controls"
import { 
  Text, 
  Box,
  Center,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react'

const ProjectCard = (props: {
  project: Project
  autoplay?: boolean
  bgScale?: number
  blur?: number
}) => {

  const { 
    project, 
    autoplay = false, 
    bgScale = 1,
    blur = 24
  } = props

  const projectRef = useRef<ProjectDirect | undefined>(undefined)
  const controls = useProjectControlsDirect(projectRef)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const animationHandle = useRef(0)

  const textBg = useColorModeValue("light.bg", 'dark.bg')

  useEffect(() => {
      const init = async () => {
          projectRef.current = new ProjectDirect()
          await projectRef.current.init(
            project, project.id, `${project.id}_bg`
          )
          setLoading(false)
      }
      init()
      return () => {
        cancelAnimationFrame(animationHandle.current)
      }
  }, [])

  const render = () => {
    controls.step()
    projectRef.current?.renderFrame()
    animationHandle.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    if (!loading) {
      if (playing || autoplay) {
        controls.play()
        animationHandle.current = requestAnimationFrame(render)
      } else {
        controls.pause()
      }
    }
    return () => cancelAnimationFrame(animationHandle.current)
  }, [playing, loading])

  const onHandleHover = () => {
    setHovered(true)
    if (!autoplay) 
      setPlaying(true)
  }
  const onHandleLeave = () => {
    setHovered(false)
    if (!autoplay) 
      setPlaying(false)
  }

  return (
    <Box 
      width="100%" 
      height="100%" 
      position="relative"
      onMouseEnter={onHandleHover}
      onMouseLeave={onHandleLeave}
      className="group"
      transition="transform 0.2s ease"
      cursor="pointer"
      _hover={{
        transform: 'scale(1.01)'
      }}
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
          zIndex: 1,
          backgroundColor: 'red',
          visibility: loading ? 'hidden':'visible',
          opacity: loading ? 0:1,
          transition: 'opacity 1.0s ease',
          pointerEvents: 'none'
        }}
      />
      <canvas
        id={`${project.id}_bg`}
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 0,
          backgroundColor: 'red',
          opacity: hovered ? 1:0,
          transform: `scale(${bgScale})`,
          filter: `blur(${blur}px) contrast(200%)`,
          transition: 'opacity 1.0s ease',
          pointerEvents: 'none'
        }}
      />

      <Text 
        position="relative" 
        display="block" 
        width="fit-content" 
        bg={textBg}  
        px="0.7rem" 
        pt="0rem"
        top="-1px"
        left="-1px"
        fontSize="xx-large" 
        fontStyle="normal"
        fontFamily="'JetBrains Mono'" 
        zIndex={2}
      >
        {props.project?.title ?? "Placeholder"}
      </Text>
      <Text 
        position="relative" 
        display="inline" 
        bg={textBg}  
        p="0.5rem" 
        pl="0.7rem"
        left="-1px"
        fontSize="med"
        fontFamily="'JetBrains Mono'" 
        zIndex={2}
      >
        {props.project?.author?.name ?? "Placeholder Author"}
      </Text>
      <Text
        position="absolute"
        bottom="0%"
        left="-1px"
        transform="auto"
        transformOrigin="bottom"
        display="inline" 
        bg={textBg}  
        p="0.5rem" 
        pl="0.7rem"
        fontSize="med" 
        fontFamily="'JetBrains Mono'" 
        zIndex={2}
        scaleY={0}
        transition="transform 0.2s ease"
        _groupHover={{
          scaleY: 1
        }}
      >
        {props.project?.description}
      </Text>
    </Box>
  )
}

export default ProjectCard
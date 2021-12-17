import React, {  ReactElement, useState } from 'react'
import { 
  Flex,
  Button,
  Text,
  IconButton,
  Box,
  Input
} from '@chakra-ui/react'
import { MdArrowRight } from 'react-icons/md'
import { FiMoreVertical } from 'react-icons/fi'
import { Divider } from '../reusable/micro'
import { themed } from '../../theme/theme'
import { useRecoilState, useRecoilValue } from "recoil"
import { layoutState, usePanels } from '../../recoil/layout'
import { projectState, title, workingProjectID } from '../../recoil/project'
import { CgGitFork } from 'react-icons/cg'
import { MdOutlinePublish } from 'react-icons/md'
import { props } from 'lodash/fp'
import { useRouter } from 'next/router'


const ProjectMenuItem = (props) => {
    return <Flex justifyContent="space-between" as={Button} borderRadius="none" border="0px" onMouseDown={props.onClick} _disabled={props.disabled}>
      <Text textAlign="left" fontSize="xs">
        {props.leftText}
      </Text>
      <Text textAlign="right" color={themed('textLight')} fontSize="xs">
        {props.rightText ?? ""}
      </Text>
    </Flex>

}

const ProjectMenuMenu = (props: {isOpen: boolean, leftText: string, setOpen: () => void, children: ReactElement[]}) => {

  return (
    <Flex 
      justifyContent="space-between"
      borderRadius="none"
      onMouseEnter={props.setOpen} 
      position="relative"
      p="0.35rem"
      px="12px"
      bg={themed("button")}
      _hover={{bg: themed("buttonHovered")}}
    >
          <Text textAlign="left" fontSize="xs" fontWeight="semibold" color={themed("textMid")}>
            {props.leftText}
          </Text>
          <MdArrowRight/>
          <Flex 
            className="dontBlur"
            backgroundColor={themed('a1')}
            minW="10rem" 
            flexDir="column"
            shadow="xl" 
            position="absolute" 
            left="100%" 
            top="0%" 
            visibility={props.isOpen?'visible':'hidden'}
            zIndex={20}
            border="1px"
            borderColor={themed('border')}
            my="-1px"
          >
            {props.children}
        </Flex>
    </Flex>
  )
}

const ProjectMenu = () => {

  const [selfOpen, setSelfOpen] = useState(false)
  const [open, setOpen] = useState(-1)

  const { 
    addPanel, 
    resetPanels, 
    onUserPublish,
    onExit
  } = useMenu()

  const onClose = () => {
    setOpen(-1)
    setSelfOpen(false)
  }

  const projectID = useRecoilValue(workingProjectID)
	const [projectTitle, setProjectTitle] = useRecoilState(title(projectID))

	const onTitleChange = (ev) => setProjectTitle(ev.target.value)

  return <>
    <Box
      position="relative"
      onBlur={onClose}
    >
      <IconButton 
        aria-label="Context Menu"
        title="Context Menu"
        icon={<FiMoreVertical/>} 
        borderRightRadius="0" 
        onClick={() => selfOpen ? onClose() : setSelfOpen(o => !o)}
      />
      <Flex 
        minW="10rem" 
        flexDir="column" 
        shadow="xl" 
        zIndex={5} 
        my="0.2rem"
        position="absolute"
        top="100%"
        border="1px"
        borderColor={themed('border')}
        bg={themed('a1')}
        opacity={selfOpen?1:0}
        visibility={selfOpen?'visible':'hidden'}
        transition="opacity 0.2s ease"
      >
        <ProjectMenuMenu leftText="File" isOpen={open==0} setOpen={() => setOpen(0)}>
          <ProjectMenuItem leftText="New" rightText="Ctrl+N"/>
          <ProjectMenuItem leftText="Load"/>
          <ProjectMenuItem leftText="Save" rightText="Ctrl+S"/>
          <Divider />
          <ProjectMenuItem leftText="Publish" onClick={onUserPublish}/>
          <ProjectMenuItem leftText="Fork"/>
          <Divider/>
          <ProjectMenuItem leftText="Exit" rightText="Ctrl+Esc" onClick={onExit}/>
        </ProjectMenuMenu>
        <ProjectMenuMenu leftText="Edit" isOpen={open==1} setOpen={() => setOpen(1)}>
          <ProjectMenuItem leftText="Undo" rightText="Ctrl+Z"/>
          <ProjectMenuItem leftText="Redo" rightText="Ctrl+Y"/>
          <Divider/>
          <ProjectMenuItem leftText="Cut" rightText="Ctrl+V"/>
          <ProjectMenuItem leftText="Copy" rightText="Ctrl+C"/>
          <Divider/>
          <ProjectMenuItem leftText="Find" rightText="Ctrl+F"/>
          <ProjectMenuItem leftText="Replace" rightText="Ctrl+R"/>
        </ProjectMenuMenu>
        <ProjectMenuMenu leftText="View" isOpen={open==2} setOpen={() => setOpen(2)}>
          <ProjectMenuItem leftText="Reset Layout" onClick={() => resetPanels()}/>
          <ProjectMenuItem leftText="Save Layout"/>
          <ProjectMenuItem leftText="Load Layout"/>
          <Divider/>
          <ProjectMenuItem leftText="Add Top Panel" onClick={() => addPanel(0, 'top')}/>
          <ProjectMenuItem leftText="Add Bottom Panel" onClick={() => addPanel(0, 'bottom')}/>
          <ProjectMenuItem leftText="Add Left Panel" onClick={() => addPanel(0, 'left')}/>
          <ProjectMenuItem leftText="Add Right Panel" onClick={() => addPanel(0, 'right')}/>
        </ProjectMenuMenu>
        <Divider/>
        <ProjectMenuMenu leftText="Compiler" isOpen={open==3} setOpen={() => setOpen(3)}/>
        <ProjectMenuMenu leftText="Project" isOpen={open==4} setOpen={() => setOpen(4)}>
          <ProjectMenuItem leftText="Publish" onClick={onUserPublish} disabled={projectID !== 'local'}/>
          <ProjectMenuItem leftText="Fork" disabled={projectID === 'local'}/>
        </ProjectMenuMenu>
        <Divider/>
        <ProjectMenuMenu leftText="Account" isOpen={open==5} setOpen={() => setOpen(5)}/>
        <ProjectMenuMenu leftText="Help" isOpen={open==6} setOpen={() => setOpen(6)}/>
      </Flex>
    </Box>
    <Input 
			maxWidth="15rem" 
			borderX="0" 
			placeholder="Unnamed Project" 
			value={projectTitle} 
			onChange={onTitleChange}
      readOnly={projectID !== 'local'}
		/>
		<IconButton
			aria-label="Fork"
      title="Fork"
			icon={<CgGitFork/>}
      borderRadius="0"
      disabled={projectID === 'local'}
		/>
		<IconButton 
			aria-label="Publish"
      title="Publish"
			icon={<MdOutlinePublish/>}
			borderLeftRadius="0"
      borderLeft="0"
      disabled={projectID !== 'local'}
      onClick={onUserPublish}
		/>
  </>
}

const useMenu = () => {
  const projectID = useRecoilValue(workingProjectID)
  const projectValue = useRecoilValue(projectState(projectID))
  const projectLayout = useRecoilValue(layoutState)
  const { addPanel, resetPanels } = usePanels()
  const router = useRouter()

  const onUserPublish = async () => {
    const response = await fetch('/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: projectValue.title,
        description: '',
        params: projectValue.params,
        shaders: projectValue.files,
        layout: projectLayout,
        published: true
      })
    })
    const id = (await response.json()).projectID
    if (id !== undefined)
      router.replace(`/create/?id=${id}`)
  }

  const onExit = () => {
    router.replace('/')
  }


  return {
    addPanel,
    resetPanels,
    onUserPublish,
    onExit
  }
}

export default ProjectMenu
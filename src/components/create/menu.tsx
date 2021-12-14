import React, {  ReactElement, useState } from 'react'
import { 
  Flex,
  Button,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton
} from '@chakra-ui/react'
import { MdArrowRight } from 'react-icons/md'
import { FiMoreVertical } from 'react-icons/fi'
import { Divider } from '../reusable/micro'
import { themed } from '../../theme/theme'
import { useRecoilValue } from "recoil"
import { usePanels } from '../../recoil/layout'
import { projectState, workingProjectID } from '../../recoil/project'


const ProjectMenuItem = (props) => {
    return <Flex justifyContent="space-between" as={Button} borderRadius="none" border="0px" onClick={props.onClick}>
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
    <Flex justifyContent="space-between" as={Button} borderRadius="none" rightIcon={<MdArrowRight/>} onMouseEnter={props.setOpen} position="relative" border="0px">
          <Text textAlign="left" fontSize="xs">
            {props.leftText}
          </Text>
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

  const { addPanel, resetPanels, onUserPublish } = useMenu()

  const onClose = () => {
    setOpen(-1)
    setSelfOpen(false)
  }

  return <Popover
			placement='bottom-start'
			gutter={7}
      isOpen={selfOpen || open >= 0}
		>
			<PopoverTrigger>
				<IconButton icon={<FiMoreVertical/>} borderRightRadius="0" onClick={() => setSelfOpen(o => !o)}/>
			</PopoverTrigger>
				<PopoverContent
					width="100%"
					backgroundColor={themed('a1')}
					borderColor={themed('border')}
          border="1px"
          borderTop="none"
					borderRadius="0px"
          onBlur={(ev) => {
            if(!ev.relatedTarget?.parentElement?.classList.contains('dontBlur'))
              onClose()
          }}
          
				>
					<Flex minW="10rem" flexDir="column" shadow="xl" zIndex={5} my="0.2rem">
            <ProjectMenuMenu leftText="File" isOpen={open==0} setOpen={() => setOpen(0)}>
              <ProjectMenuItem leftText="New" rightText="Ctrl+N"/>
              <ProjectMenuItem leftText="Load"/>
              <ProjectMenuItem leftText="Save" rightText="Ctrl+S"/>
              <Divider />
              <ProjectMenuItem leftText="Publish" onClick={onUserPublish}/>
              <ProjectMenuItem leftText="Fork"/>
              <Divider/>
              <ProjectMenuItem leftText="Exit" rightText="Ctrl+Esc"/>
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
              <ProjectMenuItem leftText="Publish" onClick={onUserPublish}/>
              <ProjectMenuItem leftText="Fork"/>
            </ProjectMenuMenu>
            <Divider/>
            <ProjectMenuMenu leftText="Account" isOpen={open==5} setOpen={() => setOpen(5)}/>
            <ProjectMenuMenu leftText="Help" isOpen={open==6} setOpen={() => setOpen(6)}/>
          </Flex>
				</PopoverContent>
		</Popover>
}

const useMenu = () => {
  const projectID = useRecoilValue(workingProjectID)
  const projectValue = useRecoilValue(projectState(projectID))
  const { addPanel, resetPanels } = usePanels()

  const onUserPublish = () => {
    fetch('/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
    })
  }


  return {
    addPanel,
    resetPanels,
    onUserPublish,
  }
}

export default ProjectMenu
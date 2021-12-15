import React, { ReactElement, useState } from "react"
import { Panel, PanelBar, PanelContent } from "../panel"
import {
  Stack,
  Box,
  Text,
  Flex,
  Icon,
  Heading,
  HStack,
  Tag,
  Avatar
} from '@chakra-ui/react'
import { themed } from "../../../theme/theme"
import { MdArrowRight } from 'react-icons/md'
import { Divider } from "../../reusable/micro"

const ProjectInfo = () => {
  return (
    <Stack>
      <Stack p="1rem" py="0.5rem">
        <Heading fontSize="xl" color={themed('textMid')}>
          Project Name
        </Heading>
        <Text fontSize="sm">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laborum illo, nisi ut repellendus id mollitia.
        </Text>
        <Stack direction={['column', 'row']} pt="0.5rem">
          <Tag> Test1 </Tag><Tag> Test2 </Tag><Tag> Test3 </Tag>
        </Stack>
      </Stack>
      <Divider/>
        <HStack dir="row" p="1rem" py="0.5rem">
          <Avatar src="test" name="Test User" size="xs" display="inline"/>
          <Text display="inline">
            Test User
          </Text>
        </HStack>
    </Stack>
  )
}

type AccordionPanelProps = {
  title: string,
  initOpen?: boolean
  children: ReactElement<any>[] | ReactElement<any>,
  first?: boolean
  last?:boolean
}
const AccordionPanel = (props: AccordionPanelProps) => {

  const { title, children, initOpen, first } = props
  const [isOpen, setOpen] = useState(initOpen ?? false)

  const onHandleClick = () => {
    setOpen(o => !o)
  }

  return (
    <Flex flexDir="column">
      <Box 
        onClick={onHandleClick}
        cursor="pointer"
        flex="0"
        borderBottom={isOpen ? "1px": props.last ? '1px':'0px'}
        borderTop={first?"0px":"1px"}
        borderColor={themed('border')}
        bg={themed('a1')}
        p="0.5rem"
        py="0.3rem"
        _hover={{
          bg:themed('buttonHovered')
        }}
      >
        <Icon 
          as={MdArrowRight}
          transform={isOpen?"rotate(90deg)":""}
          transition="transform 0.15s ease"
          mr="0.5rem"
        />
        <Text
          fontWeight="semibold"
          display="inline"
          color={themed('textMid')}
          userSelect="none"
        >
          {title}
        </Text>
      </Box>
      { isOpen &&
        <Box 
          maxHeight={isOpen ? "1000px":"0px"}
          transition="max-height 0.5s ease"
        >
          {children}
        </Box>
      }
    </Flex>
  )

}

const SummaryPanel = (props) => {

  return (
    <Panel {...props}>
      <PanelContent>
        <AccordionPanel title="Shader Info" first>
          <ProjectInfo/>
        </AccordionPanel>
        <AccordionPanel title="Files" last>
          <Text>
            Test
          </Text>
        </AccordionPanel>
      </PanelContent>
      <PanelBar>
        
      </PanelBar>
    </Panel>
  )
}

export default SummaryPanel
import React, { useEffect, ReactElement, ReactNode } from 'react'
import { 
    chakra, 
    useColorMode,
    Divider,
    IconButton,
    Input,
    Flex,
    useColorModeValue
} from '@chakra-ui/react'
import Editor from 'react-simple-code-editor'
import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import {IoIosAdd} from 'react-icons/io'
import {
    BsFileCheck,
    BsFileEarmarkPlus,
    BsFileEarmarkX,
    BsFileEarmarkArrowUp,
    BsFileEarmarkArrowDown,

} from 'react-icons/bs'

import shader from '../../shaders/compute.wgsl'

import SplitPane from 'react-split-pane'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Portal,
  useDisclosure,
} from "@chakra-ui/react"
import { CodeFiles } from './editor';




interface SidebarButtonProps {
  onClick?: () => void,
  icon: ReactElement,
  purpose: string,
  message?: string,
}

const SidebarButtonWithPopup: React.FunctionComponent<SidebarButtonProps> = (props) => {

    const {onOpen, onClose, isOpen} = useDisclosure()

    return(
        <Popover 
            computePositionOnMount 
            placement='left'
            onOpen={onOpen}
            onClose={onClose}
            isOpen={isOpen}
        >
            <PopoverTrigger>
                <IconButton 
                    m={1}
                    borderRadius='100%'
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    size="md"
                    icon={
                        React.cloneElement(props.icon, {size: 20})
                    } 
                    variant="ghost"  
                    aria-label={props.purpose} 
                    title={props.purpose}
                    _hover={{
                        bg: useColorModeValue('gray.300', 'gray.700'),
                        shadow: "lg"
                    }}
                    _focus={{
                        bg: useColorModeValue('gray.400', 'gray.600'),
                        shadow: "lg"
                    }}
                />
            </PopoverTrigger>
            <Portal>
                <PopoverContent>
                    <PopoverArrow/>
                    <PopoverCloseButton />
                    <PopoverHeader>{props.message}</PopoverHeader>
                    <PopoverBody>
                         {props.children}
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    
    
)}

const SidebarButton = (props: SidebarButtonProps) => (
    <IconButton 
        m={1}
        borderRadius='100%'
        display="flex"
        justifyContent="center"
        alignItems="center"
        size="md"
        icon={
            React.cloneElement(props.icon, {size: 20})
        } 
        variant="ghost"  
        aria-label={props.purpose} 
        title={props.purpose}
        onClick={props.onClick}
        _hover={{
            bg: useColorModeValue('gray.300', 'gray.700'),
            shadow: "lg"
        }}
        _focus={{
            bg: useColorModeValue('gray.400', 'gray.600'),
            shadow: "lg"
        }}
    />
)

interface SidebarProps {
  onCreateNewFile: () => void
  onDeleteFile: (idx: number) => void
  codeFiles: CodeFiles,
  currentFile: number,
}

const Sidebar = (props: SidebarProps) => 
  <chakra.div height="100%" backgroundColor={useColorModeValue('gray.150', 'gray.850')}>
      <Flex direction="column">
          <SidebarButton icon={<BsFileEarmarkPlus/>} purpose="New file" onClick={props.onCreateNewFile}/>
          <SidebarButtonWithPopup icon={<BsFileEarmarkX/>} purpose="Delete file" message={`Are you sure you want to delete ${props.codeFiles[props.currentFile]?.filename}`}>
              <Button onClick={() => props.onDeleteFile(props.currentFile)}>Yes</Button>
          </SidebarButtonWithPopup>
          <SidebarButton icon={<BsFileEarmarkArrowUp/>} purpose="Upload file"/>
          <SidebarButton icon={<BsFileEarmarkArrowDown/>} purpose="Download file"/>
          <Divider mt={1} mb={1} color={useColorModeValue('gray.100', 'gray.850')}/>
          <SidebarButton icon={<BsFileCheck/>} purpose="New file"/>
      </Flex>   
  </chakra.div>

export default Sidebar
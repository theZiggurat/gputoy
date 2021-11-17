import React, { useEffect } from 'react'
import { 
    Flex, 
    Box, 
    IconButton, 
    Center,
    Text,
    useColorModeValue 
} from '@chakra-ui/react';
import {FaPlay, FaStop, FaPause, FaPlus, FaUpload} from 'react-icons/fa'

import WorkingProject from '../gpu/project';
import { ProjectStatus } from '../../pages/create';


interface CanvasProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
    projectStatus: ProjectStatus,
    disabled: boolean
}

const StatusInfo = (props: {text: string, textColor?: string}) => (
    <Center mr={3} 
        backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')} 
        fontFamily='"Fira code", "Fira Mono", monospace'
        borderRadius={2}
        userSelect="none"
    >
        <Text pl={2} pr={2} fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)


export default function Canvas(props: CanvasProps) {

    const id = "canvas";

    return (
        <Flex direction="column" maxHeight="100%" width='100%' justifyContent="space-between">
            <Box
                backgroundColor="black" 
                minH={0}
                flex="1 1 auto"
            >
                <canvas id={id} style={{width: '100%', height:'100%'}}/>
            </Box>
            <Flex flex="0 0 auto" minHeight={5} justifyContent='space-between'>
                 <Flex m={3}>
                     <IconButton 
                         size="sm"
                         aria-label="Play"
                         marginRight={3}
                         icon={WorkingProject.shaderDirty ? <FaUpload/> : WorkingProject.running ? <FaPause/>:<FaPlay/>} 
                         onClick={WorkingProject.running ? props.onRequestPause : props.onRequestStart}
                         disabled={props.disabled}
                         />
                     <IconButton 
                         size="sm"
                         aria-label="Stop"
                         marginRight={3}
                         icon={<FaStop/>} 
                         onClick={props.onRequestStop}
                         disabled={props.disabled}
                         />
                 </Flex>
                 <Flex m={3}>
                     <StatusInfo text={`FPS: ${props.projectStatus.fps}`}/>
                     <StatusInfo text={`Duration: ${props.projectStatus.time}s`}/>
                     <StatusInfo text={`Status: ${props.projectStatus.gpustatus}`}/>
                 </Flex>
             </Flex>
            
        </Flex>
        
    );
    
}
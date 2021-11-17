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

import WorkingProject from '../../gpu/project';
import { ProjectStatus } from '../../../pages/create';
import Panel, {PanelBar, PanelContent, PanelBarMiddle, PanelBarEnd} from './panel'


interface CanvasProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
    projectStatus: ProjectStatus,
    disabled: boolean
}

const StatusInfo = (props: {text: string, textColor?: string}) => (
    <Center 
        p={1.5}
        mr={3} 
        backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')} 
        fontFamily='"Fira code", "Fira Mono", monospace'
        borderRadius={2}
        userSelect="none"
    >
        <Text pl={2} pr={2} fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)


const ViewportPanel: React.FC<CanvasProps> = (props: CanvasProps) => {

    return (
        <Panel {...props}>
            <PanelContent backgroundColor="black">
                <canvas id='canvas' 
                // style={{width: '100%', height:'100%'}}
                />
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    <StatusInfo text={`FPS: ${props.projectStatus.fps}`}/>
                    <StatusInfo text={`Duration: ${props.projectStatus.time}s`}/>
                    <StatusInfo text={`Status: ${props.projectStatus.gpustatus}`}/>
                </PanelBarMiddle>
                <PanelBarEnd>
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
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

export default ViewportPanel
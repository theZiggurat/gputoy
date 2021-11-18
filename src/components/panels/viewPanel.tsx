import React, { useEffect, useCallback } from 'react'
import { 
    Flex, 
    Box, 
    IconButton, 
    Center,
    Text,
    useColorModeValue,
    Fade
} from '@chakra-ui/react';
import {FaPlay, FaStop, FaPause, FaPlus, FaUpload} from 'react-icons/fa'

import WorkingProject from '../../gpu/project';
import { ProjectStatus } from '../../../pages/create';
import Panel, {PanelBar, PanelContent, PanelBarMiddle, PanelBarEnd} from './panel'
import { useResizeDetector } from 'react-resize-detector'


interface CanvasProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
    projectStatus: ProjectStatus,
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

    const [showResolution, setShowResolution] = React.useState(false)
    const [ready, setReady] = React.useState(false)

     useEffect(() => {
        const initCanvas = async () => {
            await WorkingProject.attachCanvas('canvas')
            let status = WorkingProject.status
            if (status === 'Ok')
                setReady(true)
        }
        initCanvas()
    }, [])

    const onResize = () => {
        setShowResolution(true)
    }

    const { width, height, ref } = useResizeDetector({
        refreshMode: "debounce",
        refreshRate: 10,
        onResize: onResize,
        refreshOptions: {
            leading: true,
            trailing: true
        }
    })

    useEffect(() => {
        const handle = setTimeout(() => setShowResolution(false), 2000)
        return () => clearTimeout(handle)
    }, [width, height])

    return (
        <Panel {...props}>
            <PanelContent>
                <Box bg="black" width="100%" height="100%" ref={ref} overflow="hidden">
                    <Fade in={showResolution}>
                        <Box 
                            position="absolute" 
                            left="20px" top="20px" 
                            bg="blackAlpha.600" 
                            borderRadius="lg" 
                            width="fit-content" 
                            p={3}
                        >
                            {`Resolution: ${width} x ${height}`}
                        </Box>
                    </Fade>
                    <canvas id='canvas' style={{
                        width: width,
                        height: height
                    }}/>
                </Box>
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
                        disabled={!ready}
                    />
                    <IconButton 
                        size="sm"
                        aria-label="Stop"
                        marginRight={3}
                        icon={<FaStop/>} 
                        onClick={props.onRequestStop}
                        disabled={!ready}
                    />
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

export default ViewportPanel
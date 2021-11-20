import React, { useEffect, useCallback } from 'react'
import {FaPlay, FaStop, FaPause, FaPlus, FaUpload} from 'react-icons/fa'
import WorkingProject from '../../../gpu/project';
import { ProjectStatus } from '../../../../pages/create';
import { useResizeDetector } from 'react-resize-detector'
import { RowButton } from '../../reusable/rowButton';
import { MdSettings } from 'react-icons/md';
import { 
    Box, 
    Center,
    Text,
    useColorModeValue,
    Fade
} from '@chakra-ui/react';
import { 
    Panel, 
    PanelBar, 
    PanelContent, 
    PanelBarMiddle, 
    PanelBarEnd, 
    DynamicPanelProps
} from '../panel'



interface ViewportProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
    projectStatus: ProjectStatus,
}

const StatusInfo = (props: {text: string, textColor?: string, first?: boolean, last?: boolean}) => (
    <Center 
        p={1.5}
        backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')} 
        fontFamily='"Fira code", "Fira Mono", monospace'
        userSelect="none"
        borderRadius="md"
        borderStartRadius={props.first?"":"0"}
        borderEndRadius={props.last?"":"0"}
        borderLeft={props.first?"0px":"1px"}
        borderColor="blackAlpha.300"
    >
        <Text pl={2} pr={2} fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)

const ViewportPanel = (allprops: ViewportProps & DynamicPanelProps) => {

    const {onRequestStart, onRequestPause, onRequestStop, projectStatus, instanceID, ...props} = allprops

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
        refreshRate: 100,
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
                    <StatusInfo text={`FPS: ${projectStatus.fps}`} first/>
                    <StatusInfo text={`Duration: ${projectStatus.time}s`}/>
                    <StatusInfo text={`Status: ${projectStatus.gpustatus}`} last/>
                </PanelBarMiddle>
                <PanelBarEnd>
                    <RowButton 
                        purpose="Play"
                        icon={WorkingProject.shaderDirty ? <FaUpload/> : WorkingProject.running ? <FaPause/>:<FaPlay/>} 
                        onClick={WorkingProject.running ? onRequestPause : onRequestStart}
                        disabled={!ready}
                        first
                    />
                    <RowButton 
                        purpose="Stop"
                        icon={<FaStop/>} 
                        onClick={onRequestStop}
                    />
                    <RowButton 
                        purpose="Viewport Settings"
                        icon={<MdSettings/>}
                        last
                    />
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

export const useViewportPanel = (): ViewportProps => {
    const [projectStatus, setProjectStatus] = React.useState<ProjectStatus>({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

    useEffect(() => {
        const id = setInterval(() => {
            let fps = '--'
            if (WorkingProject.dt != 0) {
                fps = (1 / WorkingProject.dt * 1000).toFixed(2).toString()
            }

            setProjectStatus(oldStatus => {
                let newStatus = {
                    gpustatus: WorkingProject.status,
                    fps: fps,
                    time: (WorkingProject.runDuration).toFixed(1).toString()
                }
                return newStatus
            })
        },(100))
        return () => clearInterval(id)
    },[])

    const onRequestStart = () => WorkingProject.run()
    const onRequestPause = () =>  WorkingProject.pause()
    const onRequestStop = () => WorkingProject.stop()

    return {
        projectStatus,
        onRequestStart,
        onRequestPause,
        onRequestStop
    }
}

export default ViewportPanel
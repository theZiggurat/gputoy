import React, { useEffect, useCallback, useLayoutEffect, useState, useRef, MutableRefObject } from 'react'
import {FaPlay, FaStop, FaPause, FaPlus, FaUpload} from 'react-icons/fa'
import WorkingProject, { Project } from '../../../gpu/project';
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
import { DefaultValue, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { canvasInitialized, canvasStatus, mousePos, projectStatus, resolution } from '../../../recoil/project';
import { useLogger } from '../../../recoil/console';
import useInstance from '../../../recoil/instance';



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

const StatusInfoGroup = () => {

    const projectStatusValue = useRecoilValue(projectStatus)

    return <>
        <StatusInfo text={`FPS: ${(1 / projectStatusValue.dt * 1000).toFixed(0)}`} first/>
        <StatusInfo text={`Duration: ${projectStatusValue.runDuration.toFixed(2)}s`}/>
        <StatusInfo text={`Framenum: ${projectStatusValue.frameNum}`} last/>
    </>
}

const ViewportPanelBarEnd = () => {

    const [onHandlePlayPause, onHandleStop] = useViewportPanelControls()
    const projectStatusState = useRecoilValue(projectStatus)

    return <>
        <RowButton 
            purpose="Play"
            icon={ projectStatusState.running ? <FaPause/>:<FaPlay/>} 
            onClick={onHandlePlayPause}
            first
        />
        <RowButton 
            purpose="Stop"
            icon={<FaStop/>} 
            onClick={onHandleStop}
        />
        <RowButton 
            purpose="Viewport Settings"
            icon={<MdSettings/>}
            last
        />
    </>
}

const RandomBox = () => {

    const projectStatusState = useRecoilValue(projectStatus)

    return <Box 
        position="absolute" 
        left="800px" top="20px" 
        bg="blackAlpha.600" 
        borderRadius="lg" 
        width="fit-content" 
        p={3}
    >
        <Text whiteSpace="pre-wrap">
            {JSON.stringify(projectStatusState, null, 2)}
        </Text>
        
    </Box>
}

// const StatusInfoGroup = ()

const ViewportPanel = (props: ViewportProps & DynamicPanelProps) => {

    const [showResolution, setShowResolution] = React.useState(false)
    const setResolution = useSetRecoilState(resolution)
    const [_ ,showExist] = useInstance(props)

    const onResize = () => {
        setShowResolution(true)
    }

    const { width, height, ref } = useResizeDetector({
        refreshMode: "debounce",
        refreshRate: 100,
        onResize: onResize,
        refreshOptions: {
            leading: false,
            trailing: true
        }
    })

    useEffect(() => {
        if (width && height)
            setResolution({width, height})
        const handle = setTimeout(() => setShowResolution(false), 2000)
        return () => clearTimeout(handle)
    }, [width, height])

    useEffect(() => {
        showExist({})
    }, [])

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
                    {/* <RandomBox/> */}
                    <ViewportCanvas instanceID={props.instanceID} width={width} height={height}/>
                </Box>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    <StatusInfoGroup/>
                    
                </PanelBarMiddle>
                <PanelBarEnd>
                    <ViewportPanelBarEnd/>
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

const ViewportCanvas = (props: {instanceID: number, width?: number, height?: number}) => {

    //const setCanvasStatus = useSetRecoilState(canvasStatus)
    const setMousePos = useSetRecoilState(mousePos)
    const setCanvasInitialized = useSetRecoilState(canvasInitialized)
    const canvasRef = useRef<MutableRefObject<HTMLCanvasElement>>()
    const logger = useLogger()
    const id = `canvas_${props.instanceID}`

    const onHandleMousePos = (evt) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            setMousePos({
                x: Math.floor(evt.clientX - rect.left),
                y: Math.floor(evt.clientY - rect.top)
            })
        }
    }

    useEffect(() => {
        const isInit = async () => setCanvasInitialized(await Project.instance().attachCanvas(id, logger))
        isInit()
    }, [])

    return <canvas id={id} ref={canvasRef} onMouseMove={onHandleMousePos} style={{
        width: props.width,
        height: props.height
    }}/>

    
}

const useViewportPanelControls = () => {
    const setProjectStatus = useSetRecoilState(projectStatus)

    const onHandlePlayPause = () => {
        setProjectStatus(old => {
            if (old.running)
                return {
                    ...old, 
                    running: false,
                    prevDuration: old.runDuration
                }
            else 
                return {
                    ...old,
                    running: true,
                    lastStartTime: performance.now(),
                }
        })
    }

    const onHandleStop = () => {
        setProjectStatus(old => { 
            return {
            ...old,
            running: false,
            frameNum: 0,
            runDuration: 0,
            prevDuration: 0,
        }})
    }

    return [onHandlePlayPause, onHandleStop]
}

export default ViewportPanel
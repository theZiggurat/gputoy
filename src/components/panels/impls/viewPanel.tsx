import React, { useEffect, useCallback, useLayoutEffect, useState, useRef } from 'react'
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
import { canvasStatus, projectRunning, projectStatus } from '../../../recoil/project';
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
        <StatusInfo text={`Duration: ${projectStatusValue.runDuration.toFixed(3)}s`}/>
        <StatusInfo text={`Framenum: ${projectStatusValue.frameNum}`} last/>
    </>
}

const ViewportPanelBarEnd = () => {

    const [onHandlePlayPause, onHandleStop] = useViewportPanel()
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
        const handle = setTimeout(() => setShowResolution(false), 2000)
        return () => clearTimeout(handle)
    }, [width, height])

    useEffect(() => {
        showExist(prev => {
            if (prev instanceof DefaultValue)
                console.log('it was default')
            else
                console.log('not default')
            return {}
        })
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

    const setCanvasStatus = useSetRecoilState(canvasStatus)
    const logger = useLogger()
    const id = `canvas_${props.instanceID}`

    useEffect(() => {
        // setCanvasStatus({
        //     id: id,
        //     attached: false
        // })
        logger.log('test', 'running')
        Project.instance().attachCanvas(id, logger)
    }, [props])

    return <canvas id={id} style={{
        width: props.width,
        height: props.height
    }}/>

    
}

const useViewportPanel = () => {
    const setProjectStatus = useSetRecoilState(projectStatus)
    //const [isProjectRunning, setProjectRunning]= useState({running: false})

    const onHandlePlayPause = () => {
        // if (!isProjectRunning.running) {
        //     setProjectStatus(old => { return {
        //         ...old,
        //         lastStartTime: performance.now(),
        //         status: 'Running',
        //     }})
        // } else {
        //     setProjectStatus(old => { return {
        //         ...old,
        //         status: 'Paused',
        //         prevDuration: old.runDuration
        //     }})
        // }
        setProjectStatus(old => {return {...old, running: !old.running}})
    }

    const onHandleStop = () => {
        // setProjectStatus(old => { 
        //     return {
        //     ...old,
        //     status: 'Ok',
        //     frameNum: 0,
        //     runDuration: 0,
        //     prevDuration: 0,
        // }})
        //setProjectRunning({running: false})
        setProjectStatus(old => {return {...old, running: false}})
    }

    // useLayoutEffect(() => {
    //     if (isProjectRunning.running) {
    
    //       const f = () => {
    //         setProjectStatus(old => { 
    //             let now = performance.now()
    //             return {
    //           ...old,
    //           runDuration: (now - old.lastStartTime) / 1000 + old.prevDuration,
    //           lastFrameRendered: now,
    //           dt: now - old.lastFrameRendered,
    //           frameNum: old.frameNum + 1
    //         }})

    //         if (isProjectRunning.running)
    //             frameHandle.current = requestAnimationFrame(f)
    //       }
    
    //       frameHandle.current = requestAnimationFrame(f)
    //     }
    //     return () => cancelAnimationFrame(frameHandle.current)
    // }, [isProjectRunning])

    return [onHandlePlayPause, onHandleStop]
}

export default ViewportPanel
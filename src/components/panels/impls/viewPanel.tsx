import React, { useEffect, useCallback, useLayoutEffect, useState, useRef } from 'react'
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
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { projectRunning, projectStatus } from '../../../recoil/project';



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

const ViewportPanel = (allprops: ViewportProps & DynamicPanelProps) => {

    const {instanceID, ...props} = allprops
    const [showResolution, setShowResolution] = React.useState(false)

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
                    <RandomBox/>
                    <canvas id={`canvas_${instanceID}`} style={{
                        width: width,
                        height: height
                    }}/>
                </Box>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    {/* <StatusInfo text={`FPS: ${(1 / projectStatus.dt * 1000).toFixed(0)}`} first/>
                    <StatusInfo text={`Duration: ${projectStatus.runDuration.toFixed(3)}s`}/>
                    <StatusInfo text={`Framenum: ${projectStatus.frameNum}`} last/> */}
                </PanelBarMiddle>
                <PanelBarEnd>
                    <ViewportPanelBarEnd/>
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

// export const useViewportPanel = (): ViewportProps => {
//     const [projectStatus, setProjectStatus] = React.useState<ProjectStatus>({
//         gpustatus: "",
//         fps: "--",
//         time: "--",
//     })

//     useEffect(() => {
//         const id = setInterval(() => {
//             let fps = '--'
//             if (WorkingProject.dt != 0) {
//                 fps = (1 / WorkingProject.dt * 1000).toFixed(2).toString()
//             }

//             setProjectStatus(oldStatus => {
//                 let newStatus = {
//                     gpustatus: WorkingProject.status,
//                     fps: fps,
//                     time: (WorkingProject.runDuration).toFixed(1).toString()
//                 }
//                 return newStatus
//             })
//         },(100))
//         return () => clearInterval(id)
//     },[])

//     const onRequestStart = () => WorkingProject.run()
//     const onRequestPause = () =>  WorkingProject.pause()
//     const onRequestStop = () => WorkingProject.stop()

//     return {
//         projectStatus,
//         onRequestStart,
//         onRequestPause,
//         onRequestStop
//     }
// }

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
import React, { useEffect, useRef, MutableRefObject, useState } from 'react'
import {FaPlay, FaStop, FaPause } from 'react-icons/fa'
import WorkingProject, { Project } from '../../../gpu/project';
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
import {  useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { canvasInitialized, mousePos, projectControl, projectStatus, resolution } from '../../../recoil/project';
import { useLogger } from '../../../recoil/console';
import useInstance from '../../../recoil/instance';
import { throttle } from 'lodash';
import consts from '../../../theme/consts';

const canvasMargin = 0

const StatusInfo = (props: {text: string, textColor?: string, first?: boolean, last?: boolean}) => (
    <Center 
        p={1.5}
        backgroundColor={useColorModeValue('light.button', 'dark.button')} 
        fontFamily={consts.fontMono}
        fontSize="0.9rem"
        userSelect="none"
        borderRadius="md"
        borderStartRadius={props.first?"":"0"}
        borderEndRadius={props.last?"":"0"}
        width={120}
    >
        <Text fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)

const StatusInfoGroup = () => {

    const projectStatusValue = useRecoilValue(projectStatus)

    return <>
        <StatusInfo text={`FPS: ${(1 / projectStatusValue.dt * 1000).toFixed(0)}`} first/>
        <StatusInfo text={`Time: ${projectStatusValue.runDuration.toFixed(2)}s`}/>
        <StatusInfo text={`Frame: ${projectStatusValue.frameNum}`} last/>
    </>
}

const ViewportPanelBarEnd = () => {

    const [projectControlValue, setProjectControl] = useRecoilState(projectControl)

    const onHandlePlayPause = () => setProjectControl(old => old == 'play' ? 'pause':'play')
    const onHandleStop = () => setProjectControl('stop')

    const handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.code == 'Space' && ev.ctrlKey) {
            onHandlePlayPause()
            ev.preventDefault()
        }
        if (ev.key == 's' && ev.ctrlKey) {
            console.log('here')
            ev.preventDefault()
        }
            
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    return <>
        <RowButton 
            purpose="Play"
            icon={ projectControlValue == 'play' ? <FaPause/>:<FaPlay/>} 
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

const ViewportCanvas = (props: {instanceID: number, width?: number, height?: number, zoom: number, pan: number[]}) => {

    const setMousePos = useSetRecoilState(mousePos)
    const setCanvasInitialized = useSetRecoilState(canvasInitialized)
    const canvasRef = useRef<HTMLCanvasElement|null>(null)
    const logger = useLogger()
    const id = `canvas_${props.instanceID}`

    const onHandleMousePos = throttle((evt) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            setMousePos({
                x: Math.floor(evt.clientX - rect.left),
                y: Math.floor(evt.clientY - rect.top)
            })
        }
    }, 30)

    useEffect(() => {
        canvasRef.current?.style.transform = `scale(${props.zoom}) translate(${props.pan[0]}px, ${props.pan[1]}px)`
    }, [props.zoom, props.pan])

    useEffect(() => {
        const isInit = async () => {
            setCanvasInitialized(await Project.instance().attachCanvas(id, logger))
        }
        isInit()
    }, [id])

    return <canvas id={id} ref={canvasRef} onMouseMove={onHandleMousePos} style={{
        width: props.width,
        height: props.height,
    }}/>

    
}

const ViewportPanel = (props: DynamicPanelProps & any) => {

    const [showResolution, setShowResolution] = useState(false)
    const setResolution = useSetRecoilState(resolution)

    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState([0, 0])
    const [isMouseDown, setMouseDown] = useState(false)

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

    const onHandleZoom = (ev) => {
        setZoom(curr => curr * (1 + -ev.deltaY / 3000))
    }

    const onHandleMouseDown = () => setMouseDown(true)
    const onHandleMouseUp = () => setMouseDown(false)
    const onHandleMouseMove = (ev) => {
        console.log(ev)
        if (!isMouseDown) return
        setPan(curr => [
            curr[0] + ev.movementX,
            curr[1] + ev.movementY,
        ])
    }

    useEffect(() => {
        if (width && height) {
            const actualW = width-canvasMargin*2
            const actualH = height-canvasMargin*2
            Project.instance().handleResize([actualW, actualH])
            setResolution({width: actualW, height: actualH})
        }
        const handle = setTimeout(() => setShowResolution(false), 2000)
        return () => clearTimeout(handle)
    }, [width, height])

    return (
        <Panel {...props}>
            <PanelContent>
                <Box 
                    bg="black" 
                    width="100%" 
                    height="100%" 
                    ref={ref} 
                    overflow="hidden" 
                    onWheel={onHandleZoom} 
                    onMouseDown={onHandleMouseDown}
                    onMouseUp={onHandleMouseUp}
                    onMouseMove={onHandleMouseMove}
                >
                    <Fade in={showResolution}>
                        <Box 
                            position="absolute" 
                            left="20px" top="20px" 
                            bg={useColorModeValue("whiteAlpha.400", "blackAlpha.400")} 
                            borderRadius="md" 
                            width="fit-content"
                            backdropFilter="blur(12px)"
                            p={3}
                        >
                            {`Resolution: ${width?.toFixed(0)} x ${height?.toFixed(0)}`}
                        </Box>
                    </Fade>
                    <ViewportCanvas 
                        instanceID={props.instanceID} 
                        width={width} 
                        height={height}
                        zoom={zoom}
                        pan={pan}
                    />
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

export default ViewportPanel
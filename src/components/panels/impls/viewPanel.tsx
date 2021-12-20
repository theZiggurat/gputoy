import {
    Box,
    Center, Fade, Text,
    useColorModeValue
} from '@chakra-ui/react';
import { Project } from '@gpu/project';
import { projectControlAtom, projectRunStatusAtom } from '@recoil/controls';
import { gpuStatusAtom } from '@recoil/gpu';
import useLogger from '@recoil/hooks/useLogger';
import { canvasInitializedAtom, mousePosAtom, resolutionAtom } from '@recoil/project';
import { throttle } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { useResizeDetector } from 'react-resize-detector';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import consts from '../../../theme/consts';
import { RowButton } from '../../shared/rowButton';
import {
    DynamicPanelProps, Panel,
    PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent
} from '../panel';

const canvasMargin = 0

const StatusInfo = (props: { text: string, textColor?: string, first?: boolean, last?: boolean }) => (
    <Center
        p={1.5}
        backgroundColor={useColorModeValue('light.button', 'dark.button')}
        fontFamily={consts.fontMono}
        fontSize="0.9rem"
        userSelect="none"
        borderRadius="md"
        borderStartRadius={props.first ? "" : "0"}
        borderEndRadius={props.last ? "" : "0"}
        width={120}
    >
        <Text fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)

const StatusInfoGroup = () => {

    const projectRunStatus = useRecoilValue(projectRunStatusAtom)

    return <>
        <StatusInfo text={`FPS: ${(1 / projectRunStatus.dt * 1000).toFixed(0)}`} first />
        <StatusInfo text={`Time: ${projectRunStatus.runDuration.toFixed(2)}s`} />
        <StatusInfo text={`Frame: ${projectRunStatus.frameNum}`} last />
    </>
}

const ViewportPanelBarEnd = () => {

    const [projectControlValue, setProjectControl] = useRecoilState(projectControlAtom)

    const onHandlePlayPause = () => setProjectControl(old => old == 'play' ? 'pause' : 'play')
    const onHandleStop = () => setProjectControl('stop')

    const handleKeyDown = (ev: KeyboardEvent) => {
        if (ev.code == 'Space' && ev.ctrlKey) {
            onHandlePlayPause()
            ev.preventDefault()
        }
        if (ev.key == 's' && ev.ctrlKey) {
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
            icon={projectControlValue == 'play' ? <FaPause /> : <FaPlay />}
            onClick={onHandlePlayPause}
            first
        />
        <RowButton
            purpose="Stop"
            icon={<FaStop />}
            onClick={onHandleStop}
        />
        <RowButton
            purpose="Viewport Settings"
            icon={<MdSettings />}
            last
        />
    </>
}

const ViewportCanvas = (props: { instanceID: number, width?: number, height?: number, zoom: number, pan: number[] }) => {

    const setMousePos = useSetRecoilState(mousePosAtom)
    const setCanvasInitialized = useSetRecoilState(canvasInitializedAtom)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const logger = useLogger()
    const gpuStatusValue = useRecoilValue(gpuStatusAtom)
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
        const isInit = async () => {
            setCanvasInitialized(await Project.instance().attachCanvas(id, logger))
        }
        if (gpuStatusValue == 'ok')
            isInit()
    }, [id, gpuStatusValue])

    return <canvas id={id} ref={canvasRef} onMouseMove={onHandleMousePos} style={{
        width: props.width,
        height: props.height,
    }} />


}

const ViewportPanel = (props: DynamicPanelProps & any) => {

    const [showResolution, setShowResolution] = useState(false)
    const setResolution = useSetRecoilState(resolutionAtom)

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
        if (width && height) {
            const actualW = width - canvasMargin * 2
            const actualH = height - canvasMargin * 2
            Project.instance().handleResize([actualW, actualH])
            setResolution({ width: actualW, height: actualH })
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
                    />
                </Box>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    <StatusInfoGroup />
                </PanelBarMiddle>
                <PanelBarEnd>
                    <ViewportPanelBarEnd />
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

export default ViewportPanel
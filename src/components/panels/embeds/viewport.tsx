import {
    Box, Button, Center, Fade,
    Flex, Text,
    useColorModeValue
} from '@chakra-ui/react';
import { Project } from '@gpu/project';
import { projectControlAtom, projectRunStatusAtom } from '@recoil/controls';
import useConsole from '@recoil/hooks/useConsole';
import useLogger from '@recoil/hooks/useLogger';
import { canvasInitializedAtom, mousePosAtom, resolutionAtom } from '@recoil/project';
import { throttle } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { useResizeDetector } from 'react-resize-detector';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import consts from '../../../theme/consts';
import { themed } from '../../../theme/theme';
import { RowButton } from '../../shared/rowButton';

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

const ViewportCanvas = (props: { width?: number, height?: number, zoom: number, pan: number[] }) => {

    const setMousePos = useSetRecoilState(mousePosAtom)
    const setCanvasInitialized = useSetRecoilState(canvasInitializedAtom)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const logger = useLogger()
    const id = 'viewport'

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
        isInit()
    }, [id])

    return <canvas id={id} ref={canvasRef} onMouseMove={onHandleMousePos} style={{
        width: props.width,
        height: props.height,
    }} />


}

const ViewportEmbeddable = () => {

    const [showResolution, setShowResolution] = useState(false)
    const setResolution = useSetRecoilState(resolutionAtom)
    const console = useConsole([false, false, true, true, false], '')

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
        <Flex
            flexDir="column"
            h="100%"
            maxH="100%"
            minH="50%"
            flex="1 1 auto"
            pos="relative"
        >
            <Button
                position="absolute"
                right="20px"
                top="20px"
                zIndex={2}
                bg={useColorModeValue("whiteAlpha.400", "blackAlpha.400")}
                borderRadius="md"
                width="fit-content"
                backdropFilter="blur(12px)"
                p="1rem"
            >
                Open in GPUToy
            </Button>
            <Box
                bg="black"
                width="100%"
                minW="100%"
                height="100%"
                ref={ref}
                overflow="hidden"
                flex="1 1"
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
                    width={width}
                    height={height}
                />
            </Box>
            <Flex flex="0 0 auto" maxH={12} p={1} justify="left" gridGap="0.5rem" bg={themed('a2')} pl="0.6rem">
                {/* <Center 
						p={1.5}
						backgroundColor={useColorModeValue('light.button', 'dark.button')} 
						fontFamily={consts.fontMono}
						fontSize="0.9rem"
						userSelect="none"
						borderRadius="md"
						width={120}
					>
						<Text fontSize={12}>{console[0]?.body ?? 'No Issues'}</Text>
					</Center> */}
                <Flex direction="row">
                    <ViewportPanelBarEnd />
                </Flex>
                <Flex direction="row" flex="1 1 auto" justifyContent="center">
                    <StatusInfoGroup />
                </Flex>

            </Flex>
        </Flex>

    )
}

export default ViewportEmbeddable
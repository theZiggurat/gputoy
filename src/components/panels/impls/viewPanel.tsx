import {
    Box,
    Button,
    Center, chakra, Fade, Flex, Portal, Text,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react';
import { Project } from '@gpu/project';
import { projectControlAtom, projectRunStatusAtom } from '@recoil/controls';
import { gpuStatusAtom } from '@recoil/gpu';
import useInstance from '@recoil/hooks/useInstance';
import useLogger from '@recoil/hooks/useLogger';
import { canvasInitializedAtom, mousePosAtom, resolutionAtom, withDefaultParams } from '@recoil/project';
import { throttle } from 'lodash';
import React, { forwardRef, MutableRefObject, useEffect, useRef, useState } from 'react';
import { BsRecordFill } from 'react-icons/bs';
import { FaPause, FaPlay, FaRecordVinyl, FaStop, FaVideo } from 'react-icons/fa';
import { MdInfo, MdSettings } from 'react-icons/md';
import { useResizeDetector } from 'react-resize-detector';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { themed } from 'theme/theme';
import consts from '../../../theme/consts';
import { RowButton } from '../../shared/rowButton';
import { EditorInstanceState, ViewportInstanceState } from '../descriptors';
import {
    DynamicPanelProps, Panel,
    PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent
} from '../panel';

import { Modal, useModal } from '@components/shared/modal'

const canvasMargin = 2

const ViewportInfo = () => {

    const defaultParams = useRecoilValue(withDefaultParams)

    return (
        <Flex
            position="absolute"
            bg={useColorModeValue("whiteAlpha.600", "blackAlpha.400")}
            width="fit-content"
            backdropFilter="blur(12px)"
            p={3}
            pointerEvents="none"
            fontSize="sm"
            flexDirection="column"
        >
            <Text><chakra.span fontWeight="bold">time: </chakra.span>{defaultParams[0].param[0].toFixed(3)}s</Text>
            <Text><chakra.span fontWeight="bold">dt: </chakra.span>{defaultParams[1].param[0].toFixed(2)}ms</Text>
            <Text><chakra.span fontWeight="bold">frame: </chakra.span>{defaultParams[2].param[0]}</Text>
            <Text><chakra.span fontWeight="bold">mouse: </chakra.span>[{defaultParams[6].param[0].toFixed(0)}, {defaultParams[6].param[1].toFixed(0)}] px</Text>
            <Text><chakra.span fontWeight="bold">mouseNorm: </chakra.span>[{defaultParams[3].param[0].toFixed(3)}, {defaultParams[3].param[1].toFixed(3)}]</Text>
            <Text><chakra.span fontWeight="bold">aspectRatio: </chakra.span>{defaultParams[4].param[0].toFixed(2)}</Text>
            <Text><chakra.span fontWeight="bold">res: </chakra.span>{defaultParams[5].param[0].toFixed(0)} by {defaultParams[5].param[1].toFixed(0)} px</Text>
        </Flex>
    )
}

const StatusInfo = () => {

    const [display, setDisplay] = useState(0)
    const projectRunStatus = useRecoilValue(projectRunStatusAtom)

    let text
    switch (display) {
        case 0: text = `${projectRunStatus.runDuration.toFixed(2)}s`; break
        case 1: text = `${(1000 / projectRunStatus.dt).toFixed(2)} fps`; break
    }

    return (

        <Center
            p={1.5}
            backgroundColor={useColorModeValue('light.input', 'dark.input')}
            fontFamily={consts.fontMono}
            fontSize="0.9rem"
            userSelect="none"
            width={120}
            onClick={() => setDisplay((display + 1) % 2)}
            unselectable="on"
        >
            <Text fontSize={12}>{text}</Text>
        </Center>
    )
}

const ViewportPanelBarMiddle = () => {


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
        <StatusInfo />
    </>
}

const _ViewportCanvas = (props: { instanceID: number, width: number, height: number }, ref) => {

    const setMousePos = useSetRecoilState(mousePosAtom)
    const setCanvasInitialized = useSetRecoilState(canvasInitializedAtom)
    //const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const logger = useLogger()
    const gpuStatusValue = useRecoilValue(gpuStatusAtom)
    const id = `canvas_${props.instanceID}`

    const projectControlValue = useRecoilValue(projectControlAtom)

    const onHandleMousePos = throttle((evt) => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setMousePos({
                x: Math.floor(evt.clientX - rect.left),
                y: Math.floor(evt.clientY - rect.top)
            })
        }
    }, 10)

    useEffect(() => {
        const isInit = async () => {
            setCanvasInitialized(await Project.instance().attachCanvas(id, logger))
        }
        if (gpuStatusValue == 'ok')
            isInit()
        return () => setCanvasInitialized(false)
    }, [id, gpuStatusValue])

    return <canvas id={id} ref={ref} onMouseMove={onHandleMousePos} style={{
        width: props.width,
        height: props.height,
        visibility: projectControlValue == 'stop' ? 'hidden' : 'visible',
        cursor: 'crosshair'
    }} />
}
const ViewportCanvas = forwardRef(_ViewportCanvas)

const ViewportPanel = (props: DynamicPanelProps & any) => {

    const [instanceState, setInstanceState] = useInstance<ViewportInstanceState>(props)
    const { showInfo } = instanceState

    const [resolution, setResolution] = useRecoilState(resolutionAtom)

    const { isOpen, openModal, closeModal, toggleModal } = useModal()
    const [videoSrc, setVideoSrc] = useState('')
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)

    useEffect(() => {
        if (recording) {
            var videoStream = canvasRef.current?.captureStream(60)
            if (videoStream === undefined) {
                alert('Could not make video stream')
                return
            }
            mediaRecorderRef.current = new MediaRecorder(videoStream)

            var chunks: Blob[] = []
            mediaRecorderRef.current.ondataavailable = (e) => {
                chunks.push(e.data)
            }

            mediaRecorderRef.current.onstop = (e) => {
                var blob = new Blob(chunks, { 'type': 'video/mp4' })
                chunks = []
                var videoURL = URL.createObjectURL(blob)
                setVideoSrc(videoURL)
            }

            mediaRecorderRef.current.start()
        } else if (mediaRecorderRef.current != null) {
            if (mediaRecorderRef.current.state != 'inactive')
                mediaRecorderRef.current.stop()
        }
    }, [recording])

    const canvasRef = useRef<HTMLCanvasElement | null>()

    const onHandleRecordToggle = () => setRecording(r => !r)

    const { width, height, ref } = useResizeDetector({
        refreshMode: "debounce",
        refreshRate: 100,
        refreshOptions: {
            leading: true,
            trailing: true
        }
    })

    useEffect(() => {
        if (width && height) {
            Project.instance().handleResize([width, height])
            setResolution({ width: width > 0 ? width : 1, height: height > 0 ? height : 1 })
        }
    }, [width, height])

    return (
        <Panel {...props}>
            <PanelContent>
                <Modal isOpen={isOpen} onRequestClose={closeModal}>
                    <Flex flexDir="column">
                        <Text>
                            Video
                        </Text>
                        <video src={videoSrc} style={{ width: width, height: height }} loop controls />
                    </Flex>
                </Modal>
                <Box p="2px" width="100%" height="100%" bg={themed('a2')} overflow="hidden">
                    <Box
                        bg='black'
                        width="100%"
                        height="100%"
                        ref={ref}
                        overflow="hidden"
                    >
                        {showInfo && <ViewportInfo />}

                        <ViewportCanvas
                            instanceID={props.instanceID}
                            width={resolution.width}
                            height={resolution.height}
                            ref={canvasRef}
                        />
                    </Box>
                </Box>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    <ViewportPanelBarMiddle />
                    <RowButton
                        color={recording ? 'red.500' : 'white'}
                        purpose="Record"
                        icon={<BsRecordFill />}
                        onClick={onHandleRecordToggle}
                        last
                    />
                </PanelBarMiddle>
                <PanelBarEnd>
                    <RowButton
                        purpose="Show Info"
                        icon={<MdInfo />}
                        onClick={() => setInstanceState({ showInfo: !showInfo })}
                        first
                    />
                    {
                        videoSrc.length > 0 &&
                        <RowButton
                            purpose="Open Video"
                            icon={<FaVideo />}
                            onClick={openModal}
                        />
                    }

                    <RowButton
                        purpose="Viewport Settings"
                        icon={<MdSettings />}
                        last
                    />
                </PanelBarEnd>
            </PanelBar>
        </Panel>
    )
}

export default ViewportPanel
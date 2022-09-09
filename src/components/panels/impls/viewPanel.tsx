import {
    Box,
    Center, Flex,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import useInstance from "@core/hooks/useInstance";
import { ProjectControl } from "core/recoil/atoms/controls";
import { resolutionAtom } from "core/recoil/atoms/project";
import { forwardRef, useEffect, useRef, useState } from "react";
import { BsRecordFill } from "react-icons/bs";
import { FaPause, FaPlay, FaStop, FaVideo } from "react-icons/fa";
import { MdInfo, MdSettings } from "react-icons/md";
import { useResizeDetector } from "react-resize-detector";
import { useRecoilState, useRecoilValue } from "recoil";
import { themed } from "theme/theme";
import consts from "../../../theme/consts";
import { RowButton } from "../../shared/rowButton";
import { ViewportInstanceState } from "../descriptors";
import {
    DynamicPanelProps,
    Panel,
    PanelBar,
    PanelBarEnd,
    PanelBarMiddle,
    PanelContent
} from "../panel";

import { Modal, useModal } from "@components/shared/modal";
import { ModelList } from "@components/shared/shadermodel";
import useChannel from "@core/hooks/useChannels";
import useProjectControls from "@core/hooks/useProjectControls";
import {
    systemBuildStateAtom,
    systemFrameStateAtom,
    systemValidationStateAtom
} from "@core/recoil/atoms/system";
import * as types from "@core/types";
import TaskReciever from "../taskReciever";

const StatusInfo = () => {
  const [display, setDisplay] = useState(0);
  const frameState = useRecoilValue(systemFrameStateAtom);
  const validationState = useRecoilValue(systemValidationStateAtom);
  const buildState = useRecoilValue(systemBuildStateAtom);

  let text;
  switch (display) {
    case 0:
      text = `${frameState.runDuration.toFixed(2)}s`;
      break;
    case 1:
      text = `${(1000 / frameState.dt).toFixed(2)} fps`;
      break;
  }

  const statusIconColor =
    validationState === "failed"
      ? "red.500"
      : buildState === "built"
      ? "green.500"
      : validationState === "validated"
      ? "yellow.500"
      : themed("textMidLight");

  return (
    <Center
      p={1.5}
      backgroundColor={useColorModeValue("light.input", "dark.input")}
      fontFamily={consts.fontMono}
      fontSize="0.9rem"
      userSelect="none"
      height="1.5rem"
      width={120}
      onClick={() => setDisplay((display + 1) % 2)}
      unselectable="on"
      pos="relative"
    >
      <Box
        bg={statusIconColor}
        w="8px"
        h="8px"
        borderRadius="6px"
        pos="absolute"
        left="8px"
      />
      <Text fontSize={12}>{text}</Text>
    </Center>
  );
};

const ViewportPanelBarMiddle = () => {
  const { controlStatus, play, pause, stop } = useProjectControls();
  const isPlay = controlStatus == ProjectControl.PLAY;
  const onHandlePlayPause = isPlay ? pause : play;

  return (
    <>
      <RowButton
        purpose="Play"
        icon={isPlay ? <FaPause size={10} /> : <FaPlay size={10} />}
        onClick={onHandlePlayPause}
        first
      />
      <RowButton purpose="Stop" icon={<FaStop size={10} />} onClick={stop} />
      <StatusInfo />
    </>
  );
};

const _ViewportCanvas = (
  props: { instanceID: number; width: number; height: number },
  ref
) => {
  const vid = "viewport_" + props.instanceID;
  const mid = "mouse_" + props.instanceID;
  const { controlStatus } = useProjectControls();

  useChannel(vid, {
    id: vid,
    label: "Viewport",
    ioType: "viewport",
    args: {
      canvasId: vid,
      mouseId: mid,
    },
  });

  return (
    <canvas
      id={vid}
      ref={ref}
      style={{
        width: props.width,
        height: props.height,
        visibility: controlStatus == ProjectControl.STOP ? "hidden" : "visible",
        cursor: "crosshair",
      }}
    />
  );
};
const ViewportCanvas = forwardRef(_ViewportCanvas);

const ViewportPanel = (props: DynamicPanelProps & any) => {
  const [instanceState, setInstanceState] =
    useInstance<ViewportInstanceState>(props);
  const { showInfo } = instanceState;

  const [resolution, setResolution] = useRecoilState(resolutionAtom);

  const { isOpen, openModal, closeModal, toggleModal } = useModal();
  const [videoSrc, setVideoSrc] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const buildState = useRecoilValue(systemBuildStateAtom);
  const validationState = useRecoilValue(systemValidationStateAtom);

  useEffect(() => {
    if (recording) {
      var videoStream = canvasRef.current?.captureStream(60);
      if (videoStream === undefined) {
        alert("Could not make video stream");
        return;
      }
      mediaRecorderRef.current = new MediaRecorder(videoStream);

      var chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = (e) => {
        var blob = new Blob(chunks, { type: "video/mp4" });
        chunks = [];
        var videoURL = URL.createObjectURL(blob);
        setVideoSrc(videoURL);
      };

      mediaRecorderRef.current.start();
    } else if (mediaRecorderRef.current != null) {
      if (mediaRecorderRef.current.state != "inactive")
        mediaRecorderRef.current.stop();
    }
  }, [recording]);

  const onTask = {
    showInfo: ({ args }: types.Task) => {
      const visible = !!args;
      setInstanceState({ showInfo: visible });
      return true;
    },
  };

  const canvasRef = useRef<HTMLCanvasElement | null>();

  const onHandleRecordToggle = () => setRecording((r) => !r);

  const { width, height, ref } = useResizeDetector({
    refreshMode: "debounce",
    refreshRate: 100,
    refreshOptions: {
      leading: true,
      trailing: true,
    },
  });

  useEffect(() => {
    if (width && height) {
      setResolution({
        width: width > 0 ? width : 1,
        height: height > 0 ? height : 1,
      });
    }
  }, [width, height]);

  return (
    <Panel {...props}>
      <TaskReciever id={props.instanceID} onTask={onTask} />
      <PanelContent>
        <Modal isOpen={isOpen} onRequestClose={closeModal}>
          <Flex flexDir="column">
            <Text>Video</Text>
            <video
              src={videoSrc}
              style={{ width: width, height: height }}
              loop
              controls
            />
          </Flex>
        </Modal>
        <Box
          p="2px"
          width="100%"
          height="100%"
          bg={themed("a2")}
          overflow="hidden"
        >
          <Box
            id={"mouse_" + props.instanceID}
            bg="black"
            width="100%"
            height="100%"
            ref={ref}
            overflow="hidden"
            pos="relative"
          >
            {showInfo && (
              <ModelList
                h="100%"
                w="fit-content"
                bg={themed("overlay")}
                p="0.5rem"
                pos="absolute"
                right="0"
                backdropFilter="blur(4px)"
              />
            )}

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
            color={recording ? "red.500" : themed("text")}
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
          {videoSrc.length > 0 && (
            <RowButton
              purpose="Open Video"
              icon={<FaVideo />}
              onClick={openModal}
            />
          )}

          <RowButton purpose="Viewport Settings" icon={<MdSettings />} last />
        </PanelBarEnd>
      </PanelBar>
    </Panel>
  );
};

export default ViewportPanel;

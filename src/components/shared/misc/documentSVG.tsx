import { Box, Portal } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useResizeDetector } from "react-resize-detector";

const DocumentSVG = (props: { children: ReactNode }) => {
  const { width, height, ref } = useResizeDetector();

  return (
    <Portal>
      <Box
        position="absolute"
        width="100vw"
        height="100%"
        left="0"
        top="0px"
        ref={ref}
        zIndex={100}
        pointerEvents="none"
        bg="none"
      >
        <svg viewBox={`0, 0 ${width} ${height}`} width={width} height={height}>
          {props.children}
        </svg>
      </Box>
    </Portal>
  );
};

export default DocumentSVG;

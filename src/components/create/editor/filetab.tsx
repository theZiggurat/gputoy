import { Button, IconButton, Text } from "@chakra-ui/react";
import FileIcon from "@components/shared/misc/fileIcon";
import { useFileMetadata } from "@core/hooks/useFiles";
import { themed } from "@theme/theme";
import { useEffect } from "react";
import { MdClose } from "react-icons/md";

type FileTabProps = {
  fileId: string;
  idx: number;
  selectedFileIdx: number;
  onSelect: (idx: number) => void;
  onClose: (fileId: string) => void;
  first?: boolean;
};

/**
 * TODO: convert to generic tab component
 */
const FileTab = (props: FileTabProps) => {
  const { fileId, idx, selectedFileIdx, onSelect, onClose, first } = props;

  const { fileMetadata } = useFileMetadata(fileId);
  const { filename, extension } = fileMetadata;
  const selected = idx === selectedFileIdx;

  useEffect(() => {
    if (extension === "_DELETED") {
      props.onClose(props.fileId);
    }
  }, [fileMetadata]);

  return (
    <Button
      h="100%"
      flex="0 0 auto"
      variant="empty"
      borderLeft={first || selected ? "1px" : "0px"}
      borderRight="1px"
      borderTop="1px"
      borderBottom={selected ? "0" : "1px"}
      borderColor={themed("borderLight")}
      borderRadius="0"
      fontWeight="normal"
      bg={selected ? themed("bg") : "none"}
      _hover={{ bg: selected ? themed("bg") : themed("input") }}
      transition="backgroundColor 0s"
      color={selected ? themed("text") : themed("textLight")}
      px="4px"
      ps="10px"
      role="group"
      onClick={(ev) => {
        onSelect(idx);
      }}
      onAuxClick={(ev) => {
        if (ev.button === 1) {
          onClose(fileId);
        }
      }}
    >
      <FileIcon extension={extension} size={12} opacity={selected ? 1 : 0.5} />

      <Text ml="6px">
        {filename}.{extension}
      </Text>
      <IconButton
        aria-label="Close file"
        borderRadius="100%"
        bg="none"
        size="xs"
        px="0.4rem"
        icon={<MdClose size={13} />}
        onClick={(ev) => {
          ev.preventDefault();
          onClose(fileId);
        }}
        _hover={{
          bg: "none",
          color: themed("textHigh"),
        }}
        opacity={selected ? 0.5 : 0}
        _groupHover={{
          opacity: 1.0,
        }}
      />
    </Button>
  );
};

export default FileTab;

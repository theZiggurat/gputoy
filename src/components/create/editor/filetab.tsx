import { Button, Text, IconButton } from "@chakra-ui/react"
import FileIcon from "@components/shared/misc/fileIcon"
import { useFileMetadata } from "@core/hooks/useFiles"
import { File } from "@core/types"
import { themed } from "@theme/theme"
import { MdClose } from "react-icons/md"

type FileTabProps = {
  fileId: string
  idx: number
  selectedFileIdx: number,
  onSelect: (idx: number) => void
  onClose: (idx: number) => void
  first?: boolean
}

/**
 * TODO: convert to generic tab component
 */
const FileTab = (props: FileTabProps) => {
  const { fileId, idx, selectedFileIdx, onSelect, onClose, first } = props

  const { fileMetadata } = useFileMetadata(fileId)
  const { filename, extension } = fileMetadata
  const selected = idx === selectedFileIdx

  return <Button
    h="100%"
    flex="0 0 auto"
    variant="empty"
    borderLeft={first || selected ? "1px" : "0px"}
    borderRight="1px"
    borderTop="1px"
    borderBottom={selected ? "0" : "1px"}
    borderColor={themed('borderLight')}
    borderRadius="0"
    fontWeight="normal"
    bg={selected ? themed('bg') : 'none'}
    onClick={() => onSelect(idx)}
    _hover={{ bg: selected ? themed('bg') : themed('input') }}
    transition="backgroundColor 0s"
    color={selected ? themed("text") : themed("textLight")}
    px="4px"
    ps="10px"
    role="group"
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
      onClick={() => onClose(idx)}
      _hover={{
        bg: 'none',
        color: themed('textHigh')
      }}
      opacity={selected ? 0.5 : 0}
      _groupHover={{
        opacity: 1.0
      }}
    />

  </Button>
}

export default FileTab
import { Button, IconButton } from "@chakra-ui/react"
import { Shader } from "@core/types"
import { themed } from "@theme/theme"
import { MdClose } from "react-icons/md"

type FileTabProps = {
  file: Shader
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
  const { file, idx, selectedFileIdx, onSelect, onClose, first } = props
  const selected = idx === selectedFileIdx

  return <Button
    h={selected ? "2.5rem" : "2rem"}
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
    _hover={{ bg: selected ? themed('p') : '' }}
    transition="backgroundColor 0s"
    color={selected ? themed("text") : themed("textLight")}
  >
    {file.filename}.{file.lang}
    <IconButton
      aria-label="Close file"
      borderRadius="100%"
      bg="none"
      size="xs"
      px="0.4rem"
      icon={<MdClose />}
      onClick={() => onClose(idx)}
    />
  </Button>
}

export default FileTab
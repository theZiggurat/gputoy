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
}

const FileTab = (props: FileTabProps) => {
  const { file, idx, selectedFileIdx, onSelect, onClose } = props
  const selected = idx === selectedFileIdx

  return <Button
    h="2.3rem"
    flex="0 0 auto"
    variant="empty"
    borderRight="1px"
    borderTop="1px"
    borderBottom={selected ? "0" : "1px"}
    borderColor={themed('borderLight')}
    borderRadius="0"
    fontWeight="normal"
    bg={selected ? themed('p') : 'none'}
    onClick={() => onSelect(idx)}
    _hover={{ bg: selected ? themed('p') : 'none' }}
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
import { Flex, IconButton } from "@chakra-ui/react"
import DirectoryList from "@components/shared/files/directoryList"
import { useDirectory } from "@core/hooks/useFiles"
import { useTaskPusher } from "@core/hooks/useTask"
import { AiFillFolderAdd, AiFillFileAdd } from "react-icons/ai"

const SummaryFiles = (props: { instanceId: string }) => {

  const pushTask = useTaskPusher(props.instanceId)
  const { directory, addFile, addDirectory, deleteDirectory, moveDirectory } = useDirectory()

  const buttonProps = {
    size: "xs",
    variant: "empty",
    height: "1rem",
  }

  const onHandleOpen = (fileId: string) => {
    pushTask({
      targetPanelIndex: 3,
      message: "addToWorkspace",
      args: fileId
    })
  }

  const onHandleAddFile = (ev) => {
    ev.stopPropagation()
    addFile('/', {
      data: '',
      extension: '_UNCREATED',
      filename: '',
      metadata: {},
    })
  }

  const onHandleAddDirectory = (ev) => {
    ev.stopPropagation()
    addDirectory('/')
  }

  const onHandleDelete = (fileId: string, force?: boolean) => {
    deleteDirectory(fileId, force)
  }

  const onHandleMove = (olddir: string, newdir: string) => {
    moveDirectory(olddir, newdir)
  }

  return <>
    <DirectoryList dir={directory} onOpen={onHandleOpen} onDelete={onHandleDelete} onMove={onHandleMove} />
    <Flex p="6px" flexDir="row-reverse">
      <IconButton
        {...buttonProps}
        aria-label="Add file"
        title="Add file"
        icon={<AiFillFileAdd size={14} />}
        onClick={onHandleAddFile}
        transform="translate(0, -1px)"
      />
      <IconButton
        {...buttonProps}
        title="Add directory"
        aria-label="Add directory"
        icon={<AiFillFolderAdd size={15} />}
        onClick={onHandleAddDirectory}
      />
    </Flex>
  </>

}

export default SummaryFiles
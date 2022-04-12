import { Flex, Box, IconButton, Icon, Text, ResponsiveValue, Input } from "@chakra-ui/react"
import { useFileMetadata } from "@core/hooks/useFiles"
import { Directory, Extension } from "@core/types"
import { themed } from "@theme/theme"
import { useMemo, useState } from "react"
import { AiFillFolderOpen, AiFillFolder } from "react-icons/ai"
import { MdCheck, MdClose, MdDelete } from "react-icons/md"
import FileIcon from "../misc/fileIcon"
import * as types from '@core/types'

const buttonProps = {
  size: "xs",
  variant: "empty",
  height: "1rem",
}

type DirectoryNameChangerProps = {
  fileMetadata?: types.FileMetadata
  onSubmit: (filename: string, extension: Extension) => void
  onCancel: () => void
  isDir?: boolean
}

const INTERNAL_DND_TYPE = 'gputoy/files'

const DirectoryNameChanger = (props: DirectoryNameChangerProps) => {

  const { fileMetadata, onSubmit, onCancel, isDir } = props

  const insertedExtension = fileMetadata?.extension === '_UNCREATED' || fileMetadata?.extension === '_DIR_UNCREATED'
    ? '' : '.' + fileMetadata?.extension
  const [userNameChange, setUserNameChange] = useState(fileMetadata?.filename + insertedExtension)
  const [inferredName, inferredExtension] = useMemo(() => {
    if (isDir) return [userNameChange, '_DIR']
    const split = userNameChange.split('.')
    const inferredExtension = split.length > 1 ? split[split.length - 1].trimEnd() : undefined
    const inferredName = split.slice(0, split.length - 1).join('.')
    return [inferredName, inferredExtension]
  }, [userNameChange])



  const isExtension = isDir || types.isSupportedFileType(inferredExtension ?? '_UNCREATED')
  const canUserSubmit = inferredName.length > 0 && isExtension

  const onHandleUserNameChange = (ev) => {
    setUserNameChange(ev.target.value)
  }

  const onHandleUserSubmit = (ev) => {
    // prevent page refresh
    ev.preventDefault()
    if (canUserSubmit) {
      onSubmit(inferredName, inferredExtension as Extension)
    }
  }

  return <form onSubmit={onHandleUserSubmit}>
    <Flex alignItems="center">

      {
        !isDir &&
        <FileIcon extension={inferredExtension as Extension} size={20} opacity={isExtension ? 1 : 0} />
      }
      {
        isDir &&
        <Icon
          as={AiFillFolder}
          size={10}
          transform="translate(1px, 0)"
          color={themed('textMidLight')}
        />
      }

      <Input
        spellCheck="false"
        type="text"
        value={userNameChange}
        onChange={onHandleUserNameChange}
        autoFocus
        variant="empty"
        size="xs"
        bg="none"
        placeholder={isDir ? "dir name" : "file name"}
      />
      <IconButton
        aria-label="Set name"
        title="Set name"
        disabled={!canUserSubmit}
        icon={<MdCheck />}
        type="submit"
        {...buttonProps}
      />
      <IconButton
        aria-label="Cancel"
        title="Cancel"
        icon={<MdClose />}
        onClick={onCancel}
        {...buttonProps}
      />
    </Flex>
  </form>
}

const DirectoryList = (props: {
  name?: string
  dir: Directory
  onOpen: (fileId: string) => void
  onDelete: (fileId: string, force?: boolean) => void
  onMove: (oldpath: string, newpath: string) => void
}) => {
  const { dir, name, onOpen, onDelete, onMove } = props
  const { fileId, c } = dir
  const { fileMetadata, setFilename, setExtension } = useFileMetadata(fileId)
  const [showChildren, setShowChildren] = useState(true)

  const [isDraggedOver, setIsDraggedOver] = useState(false)

  const onHandleNameChange = (newFileName: string, newExtension: Extension) => {
    setFilename(newFileName)
    setExtension(newExtension)
    if (newExtension !== '_DIR')
      onOpen(fileId!)
  }

  const onHandleCancelNewFile = () => {
    fileId && onDelete(fileId, true)
  }

  const toggleShowChildren = () => setShowChildren(o => !o)

  const onHandleDragOver = (ev) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
    setIsDraggedOver(true)
  }

  const onHandleDragOut = (ev) => {
    ev.preventDefault()
    setIsDraggedOver(false)
  }

  const onHandleDragStart = (ev) => {
    let path = fileMetadata.path
    path = path.endsWith('/') ? path : path.concat('/')
    ev.dataTransfer.setData(INTERNAL_DND_TYPE, path.concat(fileMetadata.filename))
    ev.dataTransfer.eventAllowed = 'move'
  }

  const onHandleDragDrop = (ev) => {
    ev.preventDefault()
    let data = ev.dataTransfer.getData(INTERNAL_DND_TYPE)
    let path = fileMetadata.path
    path = path.endsWith('/') ? path : path.concat('/')
    if (data === path.concat(fileMetadata.filename)) return
    onMove(data, path.concat(fileMetadata.filename))
    setIsDraggedOver(false)
  }


  // root of directory list
  // just return children in a fragment
  if (fileMetadata.extension === '_ROOT') {
    return <>
      <Box height="0.5rem"
        onDragOver={onHandleDragOver}
        onDragLeave={onHandleDragOut}
        onDrop={onHandleDragDrop}
      />
      {
        Object.entries(c).map(([name, dir]) => <DirectoryList
          key={dir.fileId ?? name}
          dir={dir}
          name={name}
          onOpen={onOpen}
          onDelete={onDelete}
          onMove={onMove}
        />)

      }
      <Box height="0.5rem" />
    </>
  }
  // directory
  // recursively render child files/directories
  if (fileMetadata.extension === '_DIR') {
    return <Flex flexDir="column">
      <Flex
        h="1.5rem"
        pl="1rem"
        cursor="pointer"
        justifyContent="space-between"
        alignItems="center"
        role="group"
        onClick={toggleShowChildren}
        draggable
        onDragOver={onHandleDragOver}
        onDragLeave={onHandleDragOut}
        onDrop={onHandleDragDrop}
        onDragStart={onHandleDragStart}
        bg={isDraggedOver ? themed('inputHovered') : 'none'}
        _hover={{ bg: themed('a1') }}
      >
        <Flex alignItems="center" gridGap="8px">
          <Icon
            as={showChildren || isDraggedOver ? AiFillFolderOpen : AiFillFolder}
            size={10}
            transform="translate(1px, 0)"
            color={themed('textMidLight')}
          />
          <Text fontSize="13px" fontWeight="light" color={themed('textMid')} userSelect="none"
            _groupHover={{
              color: themed('textHigh')
            }}
          >
            {name}
          </Text>
        </Flex>

        <IconButton
          aria-label="Delete File"
          title="Delete File"
          icon={<MdDelete />}
          onClick={() => fileId && onDelete(fileId)}
          {...buttonProps}
        />

      </Flex>

      <Flex flexDir="column" w="100%" pl="1rem">
        {
          showChildren && c &&
          Object.entries(c).map(([name, dir]) => <DirectoryList
            key={dir.fileId ?? name}
            dir={dir}
            name={name}
            onOpen={onOpen}
            onDelete={onDelete}
            onMove={onMove}
          />)
        }
      </Flex>
    </Flex>
  }
  // where the user enters the neame of a new file or directory they just created
  if (fileMetadata.extension === '_UNCREATED' || fileMetadata.extension === '_DIR_UNCREATED') {
    return <Flex
      w="100%"
      alignItems="center"
      pl="1rem"
      role="group"
      cursor="pointer"
      justifyContent="space-between"
      _hover={{ bg: themed('a1') }}
    >
      <DirectoryNameChanger
        onSubmit={onHandleNameChange}
        fileMetadata={fileMetadata}
        isDir={fileMetadata.extension === '_DIR_UNCREATED'}
        onCancel={onHandleCancelNewFile}
      />
    </Flex>
  }
  // file entry
  if (fileMetadata.extension !== '_DELETED') {
    return <Flex
      w="100%"
      alignItems="center"
      pl="1rem"
      role="group"
      cursor="pointer"
      justifyContent="space-between"
      _hover={{ bg: themed('a1') }}
      onClick={() => fileId && onOpen(fileId)}
      draggable
      onDragStart={onHandleDragStart}
    >
      <Flex
        alignItems="center"
        gridGap="0.5rem"
      >
        <FileIcon extension={fileMetadata.extension} size={16} />
        <Text
          fontSize="13px"
          color={themed('textMidLight')}
          userSelect="none"
          _groupHover={{
            color: themed('textHigh')
          }}
          textOverflow="ellipsis"
        >
          {fileMetadata.filename}.{fileMetadata.extension}
        </Text>
      </Flex>
      <Box>
        <IconButton
          aria-label="Delete File"
          title="Delete File"
          icon={<MdDelete />}
          onClick={() => fileId && onDelete(fileId)}
          {...buttonProps}
        />
      </Box>
    </Flex>
  }

  return <></>
}


export default DirectoryList
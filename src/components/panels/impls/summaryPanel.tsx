import {
  chakra, Avatar, Box, Flex, HStack, Icon, Stack, Tag, Text, Input, Skeleton, IconButton
} from '@chakra-ui/react'
import {
  useProjectAuthor,
  useProjectDescription,
  useProjectTitle
} from '@core/hooks/useProjectMetadata'
import useProjectSession from '@core/hooks/useProjectSession'
import { projectForkSource, projectIsPublished } from 'core/recoil/atoms/project'
import React, { ReactElement, ReactNode, useState } from "react"
import { AiFillFileAdd, AiFillFolder, AiFillFolderOpen, AiFillLike, AiOutlineFileAdd, AiOutlineFolderAdd } from 'react-icons/ai'
import { FiFolderPlus, FiFilePlus } from 'react-icons/fi'
import { BiGitRepoForked } from 'react-icons/bi'
import { IoIosEye } from 'react-icons/io'
import { MdArrowRight, MdDelete } from 'react-icons/md'
import { useRecoilValue } from 'recoil'
import { fontMono, themed, themedRaw } from "@theme/theme"
import { Divider } from "@components/shared/misc/micro"
import { Panel, PanelBar, PanelContent } from "../panel"
import OutwardLink from '@components/shared/outwardLink'
import Label from '@components/shared/label'
import { useTaskPusher } from '@core/hooks/useTask'
import { Directory } from '@core/types'
import { useDirectory, useFileMetadata } from '@core/hooks/useFiles'
import { RiFile3Fill, RiFolderFill } from 'react-icons/ri'
import FileIcon from '@components/shared/misc/fileIcon'
import DirectoryList from '@components/shared/files/directoryList'

const ProjectInfo = () => {

  const [title, setTitle] = useProjectTitle()
  const [description, setDescription] = useProjectDescription()
  const isPublished = useRecoilValue(projectIsPublished)

  const author = useProjectAuthor()
  const [_s, _l, isOwner] = useProjectSession()
  const forkSource = useRecoilValue(projectForkSource)

  let titleComponent
  let descriptionComponent
  if (title != null) {
    if (isOwner) {
      titleComponent = <Input
        value={title}
        bg="transparent"
        onChange={setTitle}
        placeholder="Project Title"
        //isInvalid={title.isValid}
        //color={title.isValid ? themed('textMid') : "red.500"}
        pl="0"
        fontWeight="bold"
        fontSize="lg"
      />
      descriptionComponent = <chakra.textarea
        value={description ?? undefined}
        onChange={setDescription}
        //color={description.isValid ? themed('textMid') : "red.500"}
        fontSize="xs"
        bg="transparent"
        w="100%"
        resize="vertical"
        outline="none"
        placeholder="Project Description"
      />
    } else {
      titleComponent = <Text
        fontWeight="bold"
        fontSize="lg"
      >
        {title}
      </Text>

      descriptionComponent = <Text
        fontSize="xs"
      >
        {description}
      </Text>
    }
  } else {
    titleComponent = <Skeleton height="20px" startColor={themed('border')} endColor={themed('borderLight')} speed={0.5} />
    descriptionComponent = (
      <>
        <Skeleton height="10px" startColor={themed('border')} endColor={themed('borderLight')} speed={0.5} />
        <Skeleton height="10px" startColor={themed('border')} endColor={themed('borderLight')} speed={0.5} />
      </>
    )
  }


  return (
    <Stack>
      <Stack p="1rem" py="0.5rem">
        {titleComponent}
        {descriptionComponent}
        <Stack direction={['column', 'row']} pt="0.5rem">
          <Tag size="sm" colorScheme="red"> wgsl </Tag><Tag size="sm" colorScheme="blue"> mouse </Tag><Tag size="sm" colorScheme="teal"> spiral </Tag>
        </Stack>
        {
          isPublished &&
          <HStack pt="0.5rem">
            <HStack>
              <AiFillLike size={13} />
              <Text fontSize="xs">529&nbsp;&nbsp;&bull;</Text>
            </HStack>
            <HStack>
              <IoIosEye size={13} />
              <Text fontSize="xs">20493&nbsp;&nbsp;&bull;</Text>
            </HStack>
            <HStack>
              <BiGitRepoForked size={13} />
              <Text fontSize="xs">29</Text>
            </HStack>
          </HStack >
        }

      </Stack>
      <Divider />
      <Stack p="1rem" py="0.5rem">
        <HStack dir="row" mb="0.5rem">
          <Avatar name={author?.name ?? 'Anonymous'} size="xs" display="inline" src={author?.image ?? undefined} />
          <Text display="inline">
            {author ? author.name ?? 'Anonymous' : 'Anonymous'}
          </Text>
        </HStack>

        {
          forkSource &&
          <Label text="Forks">
            <OutwardLink title={forkSource.title} href={`/editor/${forkSource.id}`} />
          </Label>
        }
      </Stack>

    </Stack>
  )
}

type AccordionPanelProps = {
  title: string,
  initOpen?: boolean
  children: ReactElement<any>[] | ReactElement<any>,
  first?: boolean
  last?: boolean
  rightSide?: ReactNode
}
const AccordionPanel = (props: AccordionPanelProps) => {


  const { title, children, initOpen, first, last, rightSide, ...rest } = props
  const [isOpen, setOpen] = useState(initOpen ?? false)

  const onHandleClick = () => {
    setOpen(o => !o)
  }

  return (
    <Flex flexDir="column">
      <Flex
        onClick={onHandleClick}
        cursor="pointer"
        flex="0"
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={isOpen ? "1px" : props.last ? '1px' : '0px'}
        borderTop={first ? "0px" : "1px"}
        borderColor={themed('border')}
        bg={themed('a1')}
        p="0.5rem"
        py="0.3rem"
        color={themed('textMid')}
        _hover={{
          bg: themed('a2'),
          color: themed('textHigh')
        }}
      >
        <Box>
          <Icon
            as={MdArrowRight}
            transform={isOpen ? "rotate(90deg)" : ""}
            transition="transform 0.15s ease"
            mr="0.5rem"
          />
          <Text
            fontWeight="semibold"
            display="inline"
            userSelect="none"
            fontSize="sm"
          >
            {title}
          </Text>
        </Box>
        {
          props.rightSide
        }
      </Flex>
      {isOpen &&
        <Box {...rest}>
          {children}
        </Box>
      }
    </Flex>
  )

}


const ProjectFiles = (props: { instanceId: string }) => {

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
      data: "{}",
      extension: '_UNCREATED',
      filename: '',
      metadata: {},
    })
  }

  const onHandleAddDirectory = (ev) => {
    ev.stopPropagation()
    addDirectory('/', 'newdirectory')
  }

  const onHandleDelete = (fileId: string, force?: boolean) => {
    deleteDirectory(fileId, force)
  }

  const onHandleMove = (olddir: string, newdir: string) => {
    moveDirectory(olddir, newdir)
  }

  const rightSide = <Box >
    <IconButton
      {...buttonProps}
      title="Add file"
      icon={<RiFile3Fill size={12} />}
      onClick={onHandleAddFile}
    />
    <IconButton
      {...buttonProps}
      title="Add directory"
      icon={<RiFolderFill size={13} />}
      onClick={onHandleAddDirectory}
    />
  </Box>

  return <AccordionPanel title="Files" rightSide={rightSide} bg={themed('a3')} w="100%">

    <DirectoryList dir={directory} onOpen={onHandleOpen} onDelete={onHandleDelete} onMove={onHandleMove} />

  </AccordionPanel>

}

const SummaryPanel = (props) => {



  return (
    <Panel {...props}>
      <PanelContent>
        <AccordionPanel title="Shader Info" initOpen first bg={themed('bg')}>
          <ProjectInfo />
        </AccordionPanel>
        <ProjectFiles instanceId={props.instanceID} />
        <AccordionPanel title="Pipelines">

        </AccordionPanel>
        <AccordionPanel title="Project Settings" last>

        </AccordionPanel>
      </PanelContent>
      <PanelBar>
      </PanelBar>
    </Panel>
  )
}

export default SummaryPanel
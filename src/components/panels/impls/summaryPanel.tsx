import {
  chakra, Avatar, Box, Flex, HStack, Icon, Stack, Tag, Text, Input, Skeleton, Button
} from '@chakra-ui/react'
import {
  useProjectAuthor,
  useProjectDescription,
  useProjectTitle
} from '@recoil/hooks/project/useProjectMetadata'
import useProjectSession from '@recoil/hooks/useProjectSession'
import { projectForkSource, projectIsPublished } from '@recoil/project'
import React, { ReactElement, useState } from "react"
import { AiFillLike } from 'react-icons/ai'
import { BiGitRepoForked } from 'react-icons/bi'
import { IoIosEye } from 'react-icons/io'
import { MdArrowRight } from 'react-icons/md'
import { useRecoilValue } from 'recoil'
import { themed } from "../../../theme/theme"
import { Divider } from "../../shared/misc/micro"
import { Panel, PanelBar, PanelContent } from "../panel"
import Link from 'next/link'
import { IoOpenOutline } from 'react-icons/io5'
import OutwardLink from '@components/shared/outwardLink'
import Label from '@components/shared/label'

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
    titleComponent = <Skeleton height="20px" />
    descriptionComponent = (
      <>
        <Skeleton height="10px" />
        <Skeleton height="10px" />
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
            <OutwardLink title={forkSource.title} href={`/create/${forkSource.id}`} />
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
}
const AccordionPanel = (props: AccordionPanelProps) => {


  const { title, children, initOpen, first } = props
  const [isOpen, setOpen] = useState(initOpen ?? false)

  const onHandleClick = () => {
    setOpen(o => !o)
  }

  return (
    <Flex flexDir="column">
      <Box
        onClick={onHandleClick}
        cursor="pointer"
        flex="0"
        borderBottom={isOpen ? "1px" : props.last ? '1px' : '0px'}
        borderTop={first ? "0px" : "1px"}
        borderColor={themed('border')}
        bg={themed('a1')}
        p="0.5rem"
        py="0.3rem"
        _hover={{
          bg: themed('buttonHovered')
        }}
      >
        <Icon
          as={MdArrowRight}
          transform={isOpen ? "rotate(90deg)" : ""}
          transition="transform 0.15s ease"
          mr="0.5rem"
        />
        <Text
          fontWeight="semibold"
          display="inline"
          color={themed('textMid')}
          userSelect="none"
          fontSize="sm"
        >
          {title}
        </Text>
      </Box>
      {isOpen &&
        <Box
          maxHeight={isOpen ? "1000px" : "0px"}
          transition="min-height 0.5s ease"
          bg={themed('bg')}
        >
          {children}
        </Box>
      }
    </Flex>
  )

}

const SummaryPanel = (props) => {



  return (
    <Panel {...props}>
      <PanelContent>
        <AccordionPanel title="Shader Info" initOpen first>
          <ProjectInfo />
        </AccordionPanel>
        <AccordionPanel title="Files" last>
          <Text>
            Test
          </Text>
        </AccordionPanel>
      </PanelContent>
      <PanelBar>

      </PanelBar>
    </Panel>
  )
}

export default SummaryPanel
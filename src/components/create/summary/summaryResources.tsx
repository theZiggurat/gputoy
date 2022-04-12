import { Text, Flex, IconButton, Box, Icon, Input } from "@chakra-ui/react"
import { resourceAtom, resourceKeysAtom, withAddResource } from "@core/recoil/atoms/resource"
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from "recoil"
import { themed } from '@theme/theme'
import { BiLayerPlus } from "react-icons/bi"
import { RiBracketsFill } from "react-icons/ri"
import { MdCheck, MdClose, MdDelete, MdTexture } from "react-icons/md"
import { IconType } from "react-icons"
import { CgColorPicker } from 'react-icons/cg'
import { nanoid } from "nanoid"
import { useState } from "react"
import * as types from '@core/types'
import { useTaskPusher } from "@core/hooks/useTask"
import { PANEL_TYPE } from "@components/panels/descriptors"

const typeToIcon: Record<types.ResourceType, IconType> = {
  'buffer': RiBracketsFill,
  'texture': MdTexture,
  'sampler': CgColorPicker
}

const ResourceConstructor = (props: {
  onFinish: (r: types.Resource) => void
  onCancel: () => void
}) => {

  const [name, setName] = useState('')
  const [type, setType] = useState<types.ResourceType>('buffer')

  const canUserSubmit = name.length > 0

  const onHandleUserSubmit = (ev) => {
    ev.preventDefault()
    if (canUserSubmit) {
      props.onFinish({
        id: nanoid(10),
        name,
        type,
        args: {

        },
      })
    }
  }

  return <form onSubmit={onHandleUserSubmit}>

    <Flex
      pl="1rem"
      flexDir="row"
      alignItems="center"
    >
      <Icon
        as={typeToIcon[type]}
        size={10}
        transform="translate(1px, 0)"
        color={themed('textMidLight')}
        mr="0.5rem"
      />
      <Input
        size="xs"
        value={name}
        onChange={ev => setName(ev.target.value)}
        color={themed('textMidLight')}
        textOverflow="ellipsis"
        bg="none"
        placeholder="name"
        pl="0"
        autoFocus
      />
      <IconButton
        aria-label="Create"
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
        onClick={props.onCancel}
        {...buttonProps}
      />
    </Flex>
  </form>
}

const ResourceEntry = (props: {
  resourceKey: string,
  onOpen: (key: string) => void
  onDelete: (key: string) => void
}) => {

  const { name, type } = useRecoilValue(resourceAtom(props.resourceKey))

  return <Flex
    pl="1rem"
    h="1.25rem"
    flexDir="row"
    role="group"
    alignItems="center"
    justifyContent="space-between"
    color={themed('textMidLight')}
    _hover={{
      bg: themed('a1'),
      color: themed('textHigh')
    }}
    cursor="pointer"
    onClick={() => props.onOpen(props.resourceKey)}
  >
    <Flex gridGap="0.5rem" alignItems="center">
      <Icon
        as={typeToIcon[type]}
        size={10}
        transform="translate(1px, 0)"
      />
      <Text
        fontSize="13px"
        userSelect="none"
        textOverflow="ellipsis"
      >
        {name}
      </Text>
    </Flex>
    <IconButton
      aria-label="Delete Resource"
      title="Delete File"
      icon={<MdDelete />}
      onClick={() => props.onDelete(props.resourceKey)}
      {...buttonProps}
    />
  </Flex>
}

const buttonProps = {
  size: "xs",
  variant: "empty",
  height: "1rem",
}

const SummaryResources = (props: { instanceId: string }) => {

  const [resourceKeys, setResourceKeys] = useRecoilState(resourceKeysAtom)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const addResource = useSetRecoilState(withAddResource)
  const pushTask = useTaskPusher(props.instanceId)

  const onHandleAddResource = () => {
    setIsAddingResource(true)
  }

  const onHandleOpen = (key: string) => {
    pushTask({
      // target resource panel
      targetPanelIndex: 6,
      message: 'openResource',
      args: key
    })
  }

  const onHandleDelete = (key: string) => {
    setResourceKeys(old => {
      let _new = [...old]
      const idx = _new.indexOf(key)
      _new.splice(idx, 1)
      return _new
    })
  }

  const onAddResourceFinish = (r: types.Resource) => {
    addResource(r)
    setIsAddingResource(false)
  }

  const onAddResourceCancel = () => {
    setIsAddingResource(false)
  }

  return <Flex
    flexDir="column"
    fontSize="xs"
    color={themed('textMid')}
  >
    <Box h="0.5rem" />
    {
      resourceKeys.map(k => {
        return <ResourceEntry
          key={k}
          resourceKey={k}
          onOpen={onHandleOpen}
          onDelete={onHandleDelete}
        />
      })
    }
    {
      isAddingResource &&
      <ResourceConstructor onFinish={onAddResourceFinish} onCancel={onAddResourceCancel} />
    }
    <Flex p="6px" flexDir="row-reverse">
      <IconButton
        {...buttonProps}
        aria-label="Add Resource"
        title="Add Resource"
        icon={<BiLayerPlus size={14} />}
        onClick={onHandleAddResource}
        transform="translate(0, -1px)"
      />
    </Flex>
  </Flex>
}

export default SummaryResources
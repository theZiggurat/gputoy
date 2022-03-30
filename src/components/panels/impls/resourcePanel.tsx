import { Box, chakra, Flex, IconButton, Input } from "@chakra-ui/react";
import { RowButton } from "@components/shared/rowButton";
import { resourceAtom, resourceKeysAtom } from "@core/recoil/atoms/resource";
import { fontMono } from "@theme/theme";
import { nanoid } from "nanoid";
import { MdAdd } from "react-icons/md";
import { useRecoilState } from "recoil";
import { themed } from "@theme/theme";
import * as types from '@core/types'
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent, PanelInProps } from "../panel";
import useInstance, { useInstances } from "@core/hooks/useInstance";
import { ResourceInstanceState } from "../descriptors";
import { useTaskReciever } from "@core/hooks/useTask";

type ResourceEntryProps = {
  resourceKey: string
}



const ResourceEntry = (props: ResourceEntryProps) => {

  const optionStyle = {
    backgroundColor: themed('a1'),
    border: "none"
  }

  const bgProps = {
    bg: themed('a2'),
    _hover: {
      bg: themed('a1')
    }
  }

  const { resourceKey } = props
  const [{ name, type, args, frozen }, setResource] = useRecoilState(resourceAtom(resourceKey))

  return <Flex
    borderBottom="2px"
    borderColor={themed("borderLight")}
  >
    <Input
      value={name}
      fontSize="0.75rem"
      bg="none"
      _hover={{ bg: 'none' }}
      placeholder="Resource Name"
      onChange={s => setResource(old => ({ ...old, name: s.target.value }))}
      borderRadius="0px"
      fontFamily={fontMono}
      spellCheck={false}
      color={themed('textMid')}
      paddingInlineEnd="0"
    />
    <chakra.select
      color={themed('textMidLight')}
      fontSize="0.75rem"
      fontWeight="bold"
      value={type}
      onChange={s => setResource(old => ({ ...old, type: s.target.value as types.ResourceType }))}

      sx={bgProps}
      px="0.25rem"
      borderX="1px"
      borderColor={themed('borderLight')}
    >
      <option value="buffer" style={optionStyle}>Buffer</option>
      <option value="texture" style={optionStyle}>Texture</option>
      <option value="sampler" style={optionStyle}>Sampler</option>
    </chakra.select>
  </Flex>
}

const ResourcePanelContent = (props: {
  resourceKey: string
}) => {

  const [resource, setResource] = useRecoilState(resourceAtom(props.resourceKey))

  return <Flex
    w="100%"
    fontSize="xxx-large"
    fontWeight="black"

  >
    {resource.name} <br />
    {resource.type}
  </Flex>
}

const ResourcePanel = (props: PanelInProps) => {

  const [instanceState, setInstanceState] = useInstance<ResourceInstanceState>(props)
  const { openResource } = instanceState

  const setOpenResource = (resourceKey?: string) => {
    setInstanceState(old => ({
      ...old,
      openResource: resourceKey
    }))
  }

  useTaskReciever(props.instanceID, {
    // recieves open resource command from other components
    // arg: string resourceKey
    "openResource": task => {
      if (typeof task.args === 'string') {
        setOpenResource(task.args)
      }
      return true
    }
  })

  return <Panel {...props}>
    <PanelContent>
      {
        openResource &&
        <ResourcePanelContent resourceKey={openResource} />
      }
    </PanelContent>
    <PanelBar>
      <PanelBarMiddle>
        {/* <RowButton
          purpose="Add resource"
          icon={<MdAdd />}
          onClick={onResourceAdd}
          first
        /> */}
      </PanelBarMiddle>
      <PanelBarEnd>

      </PanelBarEnd>
    </PanelBar>
  </Panel>
}

export default ResourcePanel
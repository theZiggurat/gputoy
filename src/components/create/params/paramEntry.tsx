import { Box, BoxProps, Flex, Text } from "@chakra-ui/layout"
import { Input, Select, IconButton, FlexboxProps } from "@chakra-ui/react"
import { ParamDesc, ParamType } from "@gpu/types"
import { projectParamsAtom } from "@recoil/project"
import React, { useState } from "react"
import { useRecoilState } from "recoil"
import Dropdown from "../dropdown"
import { themed } from '../../../theme/theme'
import { interfaces, typeToInterface } from "./paramInterface"
import { typeToInputs } from "./paramInput"
import { VscMenu } from 'react-icons/vsc'

type ParamEntryProps = {
  onSelect: (k: string) => void
  paramKey: string,
  showDropdown?: boolean,
  showField?: boolean,
  showMover?: boolean
  highlight?: boolean
}

const ParamEntry = (props: ParamEntryProps & BoxProps) => {
  const { onSelect, paramKey, showDropdown, showField, showMover, highlight, ...flexProps } = props
  const [param, setParam] = useRecoilState(projectParamsAtom(paramKey))
  const [open, setOpen] = useState(false)

  const onHandleValueChange = (newval: number[]) => setParam(old => ({ ...old, param: newval }))

  const elem = interfaces[typeToInterface[param.paramType][0]]
  const input = typeToInputs[param.paramType]

  const onParamNameChange = (ev) => {
    setParam(old => ({ ...old, paramName: ev.target.value }))
  }

  return <Flex
    //width={highlight ? "100%" : "98%"}
    height="2.5rem"
    onFocus={() => onSelect(paramKey)}
    bg={highlight ? themed('a3') : themed('a2')}
    my="3px"
    transition="background-color 0.1s ease"
    _hover={{
      bg: highlight ? themed('a1') : themed('input')
    }}
    alignItems="center"
    {...flexProps}
  >
    {
      showMover &&
      <IconButton
        aria-label="Move param"
        title="Move param"
        size="sm"
        variant="empty"
        color={themed('textLight')}
        icon={<VscMenu />}
      />
    }

    <Input
      value={param.paramName}
      bg="none"
      width="16rem"
      _hover={{ bg: 'none' }}

      onChange={onParamNameChange}
    />
    <Select
      w="10rem"
      flex="0 1 auto"
      minW={0}
      value={param.paramType}
      onChange={(ev) => {
        setParam(old => ({ ...old, paramType: ev.target.value as ParamType }))
      }}
      bg='none'
      border="none"
      size="xs"
    >
      <option value="int">int</option>
      <option value="float">float</option>
      <option value="color">color</option>
      <option value="vec2f">vec2f</option>
      <option value="vec3f">vec3f</option>
      <option value="vec2i">vec2i</option>
      <option value="vec3i">vec3i</option>
    </Select>
    <Flex
      flexDir="row"
      width="20rem"
    >
      {React.createElement(input,
        {
          value: param.param,
          onChange: onHandleValueChange,
          opened: open
        }
      )
      }
    </Flex>

  </Flex>
}

export default ParamEntry
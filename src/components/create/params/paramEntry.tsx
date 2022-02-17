import { Box, BoxProps, Flex, Text } from "@chakra-ui/layout"
import { Input, Select, IconButton, FlexboxProps, chakra } from "@chakra-ui/react"
import { ParamDesc, ParamType } from "core/types"
import { projectParamsAtom } from "core/recoil/atoms/project"
import React, { useState } from "react"
import { useRecoilState } from "recoil"
import Dropdown from "../dropdown"
import { themed } from '../../../theme/theme'
import { interfaces, typeToInterface } from "./paramInterface"
import { typeToInputs } from "./paramInput"
import { VscMenu } from 'react-icons/vsc'

const paramDefaultValues = {
  "int": [0],
  "float": [0],
  "vec2f": [0, 0],
  "vec2i": [0, 0],
  "vec3f": [0, 0, 0],
  "vec3i": [0, 0, 0],
  "color": [0, 0, 0],
}

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
    height="2.5rem"
    onFocus={() => onSelect(paramKey)}
    bg={highlight ? themed('a3') : themed('a2')}
    my="3px"
    transition="background-color 0.1s ease"
    _hover={{
      bg: themed('a1')
    }}
    borderY={highlight ? "1px" : "0px"}
    borderColor={themed("dividerLight")}
    boxSizing="border-box"
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
      placeholder="param name"
      onChange={onParamNameChange}
      borderRadius="0px"
    //border="1px solid"
    //borderColor="red.500"

    />
    <chakra.select
      bg="none"
      fontSize="xs"
      value={param.paramType}
      onChange={(ev) => {
        const paramType = ev.target.value as ParamType
        setParam(old => ({ ...old, paramType, param: paramDefaultValues[paramType] }))
      }}
    >
      <option value="int">int</option>
      <option value="float">float</option>
      <option value="color">color</option>
      <option value="vec2f">vec2f</option>
      <option value="vec3f">vec3f</option>
      <option value="vec2i">vec2i</option>
      <option value="vec3i">vec3i</option>
    </chakra.select>
    <Flex
      flexDir="row"
      width="20rem"
    >
      {
        React.createElement(input,
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
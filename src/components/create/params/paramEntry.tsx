import { Box, BoxProps, Flex, Text } from "@chakra-ui/layout"
import { Input, Select, IconButton, FlexboxProps, chakra } from "@chakra-ui/react"
import { ParamDesc, ParamType } from "core/types"
import { projectParamsAtom } from "core/recoil/atoms/project"
import React, { useState } from "react"
import { useRecoilState } from "recoil"
import Dropdown from "../dropdown"
import { fontMono, themed } from '../../../theme/theme'
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
  "color": [0, 0, 0, 1],
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

  const bgProps = {
    bg: highlight ? themed('a3') : themed('a2'),
    _hover: {
      bg: themed('a1')
    }
  }

  const optionStyle = {
    backgroundColor: themed('a1'),
    border: "none"
  }

  const onParamNameChange = (ev) => {
    setParam(old => ({ ...old, paramName: ev.target.value }))
  }

  return <Flex

    onClick={() => onSelect(paramKey)}
    my="3px"
    transition="background-color 0.1s ease"
    borderY="1px"
    borderColor={highlight ? themed("borderLight") : 'transparent'}
    justifyContent="space-between"
    alignItems="center"
    gridGap="1rem"
    {...flexProps}
    {...bgProps}
  >
    <Flex minW="50%" justifyContent="space-between" px="0.5rem">
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
        fontSize="0.75rem"
        bg="none"
        _hover={{ bg: 'none' }}
        placeholder="param name"
        onChange={onParamNameChange}
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
        value={param.paramType}
        onChange={(ev) => {
          const paramType = ev.target.value as ParamType
          setParam(old => ({ ...old, paramType, param: paramDefaultValues[paramType], interface: 0 }))
        }}
        bg="none"
        sx={bgProps}
        outline="none"
        px="0.25rem"
        borderX="1px"
        borderColor={highlight ? themed('borderLight') : "transparent"}
      >
        <option value="int" >int</option>
        <option value="float" style={optionStyle}>float</option>
        <option value="color" style={optionStyle}>color</option>
        <option value="vec2f" style={optionStyle}>vec2f</option>
        <option value="vec3f" style={optionStyle}>vec3f</option>
        <option value="vec2i" style={optionStyle}>vec2i</option>
        <option value="vec3i" style={optionStyle}>vec3i</option>
      </chakra.select>
    </Flex>

    <Flex
      flexDir="row"
      w="100%"
      h="100%"
      alignItems="center"
      px="1rem"
      bg={themed('input')}
      boxShadow="-1px 0px 5px 0px rgba(0,0,0,0.1)"
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
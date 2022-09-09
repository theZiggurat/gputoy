import { Box, Flex, Input, NumberInput, Text } from "@chakra-ui/react";
import Checkbox from "@components/shared/checkbox";
import Label from "@components/shared/label";
import { systemNamespaceListAtom, withSystemModels, withSystemNamespace } from "@core/recoil/atoms/system";
import * as types from '@core/types'
import { themed } from '@theme/theme'
import { CUIAutoComplete } from "chakra-ui-autocomplete";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";
// import {
//   Select,
//   CreatableSelect,
//   AsyncSelect,
//   OptionBase,
//   GroupBase
// } from 'chakra-react-select'

const BufferInfo = (props: {
  args: types.BufferArgs,
  onChange: (args: types.BufferArgs) => void
}) => {

  const models = useRecoilValue(withSystemModels)

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

  const labelProps = {
    borderY: "1px",
    h: '2rem',
    borderColor: themed('borderLight'),
    px: "0.75rem",
    pt: "1px",
    alignItems: "center",
    bg: themed('a2')
  }

  const inputProps = {
    bg: "none",
    border: "0px",
    borderBottom: "2px",
    _hover: { bg: 'none' },
    borderColor: themed('borderLight')
  }

  const onChangeBindingType = (type: GPUBufferBindingType) => {
    props.onChange({
      ...props.args,
      bindingType: type
    })
  }

  const onToggleUsage = (flag: number) => {
    props.onChange({
      ...props.args,
      usageFlags: usageFlags ^ flag
    })
  }

  const onModelNameChange = ev => {
    props.onChange({
      ...props.args,
      modelName: ev.target.value
    })
  }

  const modelList = useMemo(() =>
    models
      .map(m => Object.keys(m.namedTypes))
      .flat()
      .map(s => ({ 'value': s, 'label': s })), [models])

  const { bindingType, usageFlags, initialValue, size, modelName } = props.args

  const namespaces = useRecoilValue(withSystemNamespace)
  const model = !!modelName ? types.getStructFromNamespaces(namespaces, modelName) : null
  const mem_info = model ? types.getMemoryLayout(model) : null
  const numBytes = mem_info ? mem_info.byteSize * (size ?? 0) : 0

  return <Flex
    flex="1 1 auto"
    h="100%"
    overflowY="scroll"
    bg={themed('a2')}
    flexDir="column"
    gridGap="4px"
    py="4px"
  >
    <Label text="Binding Type" {...labelProps} h="min-content">
      <Flex flexDir="column" flexWrap="wrap" py="4px" gridGap="2px">
        <Checkbox
          title="Uniform"
          checked={bindingType === 'uniform'}
          onCheck={_ => onChangeBindingType('uniform')}
          hint="If checked, this texture can be read from outside of a shader."
        />
        <Checkbox
          title="Storage"
          checked={bindingType === 'storage'}
          onCheck={_ => onChangeBindingType('storage')}
          hint="If checked, this texture can be written to outside of a shader."
        />
        <Checkbox
          title="Read-only Storage"
          checked={bindingType === 'read-only-storage'}
          onCheck={_ => onChangeBindingType('read-only-storage')}
          hint="If checked, this texture can be read from a shader using a sampler."
        />
      </Flex>
    </Label>

    <Label text="Usage" {...labelProps} h="min-content">
      <Flex flexDir="column" flexWrap="wrap" py="4px" gridGap="2px">
        <Checkbox
          title="COPY_SRC"
          checked={!!(usageFlags & GPUBufferUsage.COPY_SRC)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.COPY_SRC)}
          hint="The buffer can be used as the source of a copy operation."
        />
        <Checkbox
          title="COPY_DST"
          checked={!!(usageFlags & GPUBufferUsage.COPY_DST)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.COPY_DST)}
          hint="The buffer can be used as the destination of a copy or write operation."
        />
        <Checkbox
          title="INDEX"
          checked={!!(usageFlags & GPUBufferUsage.INDEX)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.INDEX)}
          hint="The buffer can be used as an index buffer."
        />
        <Checkbox
          title="VERTEX"
          checked={!!(usageFlags & GPUBufferUsage.VERTEX)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.VERTEX)}
          hint="The buffer can be used as a vertex buffer."
        />
        <Checkbox
          title="UNIFORM"
          checked={!!(usageFlags & GPUBufferUsage.UNIFORM)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.UNIFORM)}
          hint="The buffer can be used as a uniform buffer."
        />
        <Checkbox
          title="STORAGE"
          checked={!!(usageFlags & GPUBufferUsage.STORAGE)}
          onCheck={_ => onToggleUsage(GPUBufferUsage.STORAGE)}
          hint="The buffer can be used as a storage buffer. "
        />
      </Flex>
    </Label>

    <Label text="Model" {...labelProps} justifyContent="space-between">
      <Input
        marginStart="50%"
        value={modelName}
        onChange={onModelNameChange}
        {...inputProps}
      />
    </Label>

    <Label text="Size" {...labelProps}>
      <NumberInput {...inputProps} />
    </Label>

    <Label text="Bytes" >
      {numBytes}
    </Label>
  </Flex>
}

export default BufferInfo
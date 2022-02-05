import { Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react'
import React from 'react'
import { themed } from 'theme/theme'

type InputProps = {
  value: number[],
  onChange: (newval: number[]) => void,
}

const inputProps = {
  bg: 'none',
  _hover: {
    bg: 'none'
  }
}

const FloatInput = (props: InputProps) => (
  <Input
    type="number"
    value={props.value[0]}
    onChange={ev => props.onChange([+ev.target.value])}
    {...inputProps}
  />
)

const Vec2FInput = (props: InputProps) => {
  return <>
    x: <NumberInput
      bg="none"
      value={props.value[0]}
      onChange={(_s, num) => props.onChange([num, props.value[1]])}
      step={0.05}
      size="xs"
      precision={2}
      allowMouseWheel
    >
      <NumberInputField border="0px" />
    </NumberInput>
    y: <NumberInput
      bg="none"
      value={props.value[1]}
      onChange={(_s, num) => props.onChange([props.value[1], num])}
      step={0.05}
      size="xs"
      precision={2}
      allowMouseWheel
    >
      <NumberInputField border="0px" pr="0px" />
    </NumberInput>
  </>
}

export const typeToInputs = {
  'int': FloatInput,
  'float': FloatInput,
  'color': FloatInput,
  'vec3f': FloatInput,
  'vec3i': FloatInput,
  'vec2f': Vec2FInput,
  'vec2i': FloatInput,
}
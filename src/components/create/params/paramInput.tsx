import { chakra, Flex, NumberInput, NumberInputField, NumberInputProps } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { fontMono, themed } from 'theme/theme'

const ValueInput = (props: { label: string, value: number, onValueChange: (val: number) => void } & NumberInputProps) => {

  const { label, value, onValueChange, ...iProps } = props
  const [val, setVal] = useState(value.toString())

  useEffect(() => {
    setVal(value.toString())
  }, [value])

  const onHandleSet = () => {
    const numberValue = Number(val)
    onValueChange(isNaN(numberValue) ? 0 : numberValue)
  }

  const onHandleKeyDown = (ev) => {
    if (ev.code === "Enter")
      onHandleSet()
  }

  const onHandleWheel = () => {
    onHandleSet()
  }

  return <Flex px="0.5rem" pr="0" fontSize="0.75rem" alignItems="center" onKeyDown={onHandleKeyDown} onWheel={onHandleWheel} fontFamily={fontMono}>
    <chakra.span color={themed('textLight')} fontWeight="bold" >
      {props.label}:
    </chakra.span>
    <NumberInput
      value={val}
      bg="none"
      size="xs"
      fontSize="0.75rem"
      mx="0.5rem"
      allowMouseWheel
      onChange={s => setVal(s)}
      onBlur={onHandleSet}
      {...iProps}
    >
      <NumberInputField _hover={{ bg: "none", borderColor: 'red.500' }} paddingInline="0" border="0px" />
    </NumberInput>
  </Flex>
}

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

const IntInput = (props: InputProps) => (
  <ValueInput
    value={props.value[0]}
    precision={0}
    onValueChange={num => props.onChange([num])}
    label="val"
  />
)

const FloatInput = (props: InputProps) => (
  <ValueInput
    value={props.value[0]}
    step={0.05}
    precision={4}
    onValueChange={num => props.onChange([num])}
    label="val"
  />
)

const Vec2FInput = (props: InputProps) => {
  return <>
    <ValueInput
      value={props.value[0]}
      step={0.05}
      precision={4}
      onValueChange={num => props.onChange([num, props.value[1]])}
      label="x"
    />
    <ValueInput
      value={props.value[1]}
      step={0.05}
      precision={4}
      onValueChange={num => props.onChange([props.value[0], num])}
      label="y"
    />
  </>
}

const Vec2IInput = (props: InputProps) => {
  return <>
    <ValueInput
      value={props.value[0]}
      precision={0}
      onValueChange={num => props.onChange([num, props.value[1]])}
      label="x"
    />
    <ValueInput
      value={props.value[1]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], num])}
      label="y"
    />
  </>
}

const Vec3FInput = (props: InputProps) => {
  return <>
    <ValueInput
      value={props.value[0]}
      step={0.05}
      precision={4}
      onValueChange={num => props.onChange([num, props.value[1], props.value[2]])}
      label="x"
    />
    <ValueInput
      value={props.value[1]}
      step={0.05}
      precision={4}
      onValueChange={num => props.onChange([props.value[0], num, props.value[2]])}
      label="y"
    />
    <ValueInput
      value={props.value[2]}
      step={0.05}
      precision={4}
      onValueChange={num => props.onChange([props.value[0], props.value[1], num])}
      label="z"
    />
  </>
}

const Vec3IInput = (props: InputProps) => {
  return <>
    <ValueInput
      value={props.value[0]}
      precision={0}
      onValueChange={num => props.onChange([num, props.value[1], props.value[2]])}
      label="x"
    />
    <ValueInput
      value={props.value[1]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], num, props.value[2]])}
      label="y"
    />
    <ValueInput
      value={props.value[2]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], props.value[1], num])}
      label="z"
    />
  </>
}

const ColorInput = (props: InputProps) => {
  return <>
    <ValueInput
      value={props.value[0]}
      precision={0}
      onValueChange={num => props.onChange([num, props.value[1], props.value[2], props.value[3]])}
      label="r"
    />
    <ValueInput
      value={props.value[1]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], num, props.value[2], props.value[3]])}
      label="g"
    />
    <ValueInput
      value={props.value[2]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], props.value[1], num, props.value[3]])}
      label="b"
    />
    <ValueInput
      value={props.value[3]}
      precision={0}
      onValueChange={num => props.onChange([props.value[0], props.value[1], props.value[2], num])}
      label="a"
    />
  </>
}

export const typeToInputs = {
  'int': IntInput,
  'float': FloatInput,
  'color': ColorInput,
  'vec3f': Vec3FInput,
  'vec3i': Vec3IInput,
  'vec2f': Vec2FInput,
  'vec2i': Vec2IInput,
}
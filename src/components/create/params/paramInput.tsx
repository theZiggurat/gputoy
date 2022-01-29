import { Input } from '@chakra-ui/react'

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

export const typeToInputs = {
  'int': FloatInput,
  'float': FloatInput,
  'color': FloatInput,
  'vec3f': FloatInput,
  'vec3i': FloatInput,
  'vec2f': FloatInput,
  'vec2i': FloatInput,
}
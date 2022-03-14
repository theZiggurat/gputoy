import { Box, chakra, Flex, FlexProps } from "@chakra-ui/react"
import { themed } from "theme/theme"

type CheckboxProps = {
  title: string,
  checked?: boolean
  onCheck: (val: boolean) => void
}

const Checkbox = (props: FlexProps & CheckboxProps) => {

  const { title, checked, onCheck, ...flexProps } = props

  const mainColor = checked ? themed('border') : themed('borderLight')
  const textColor = checked ? themed('textMidLight') : themed('border')

  return (
    <Flex
      onClick={() => onCheck(!checked)}
      cursor="pointer"
      height="min-content"
      alignItems="center"
      {...flexProps}
    >
      <Box
        w="8px"
        h="8px"
        p="0"
        mr="4px"
        borderRadius="0"
        border="1px"
        bg={checked ? themed('borderLight') : 'none'}
        borderColor={mainColor}
      >
      </Box>
      <chakra.label fontSize="xx-small" color={textColor} display="inline" pointerEvents="none" userSelect="none">
        {props.title}
      </chakra.label>
    </Flex>
  )
}

export default Checkbox
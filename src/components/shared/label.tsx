import { Flex, chakra, Box, FlexProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { themed } from "theme/theme"

type LabelProps = {
  text: string
  children: ReactNode
}
const Label = (props: LabelProps & FlexProps) => {
  const { text, children, ...flexProps } = props
  return <Flex
    fontSize="sm"
    justifyContent="space-between"
    alignItems="center"
    {...flexProps}
  >
    <chakra.span
      fontWeight="semibold"
      color={themed('textMid')}
      fontSize="xs"
    >
      {text}
    </chakra.span>
    <Box>

      {children}
    </Box>
  </Flex>
}

export default Label
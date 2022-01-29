import { Flex, chakra } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { themed } from "theme/theme"

type LabelProps = {
  text: string
  children: ReactNode
}
const Label = (props: LabelProps) => {
  return <Flex
    fontSize="sm"
    justifyContent="space-between"
    alignItems="center"
  >
    <chakra.span
      fontWeight="semibold"
      color={themed('textMid')}
      fontSize="xs"
    >
      {props.text}
    </chakra.span>
    {props.children}
  </Flex>
}

export default Label
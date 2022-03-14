import {
  Button, ButtonProps, IconButton,
  IconButtonProps, useColorModeValue
} from '@chakra-ui/react'
import { themed } from '@theme/theme';
import React from 'react'

declare type OmittedProps = "aria-label";
interface RowButtonProps extends Omit<IconButtonProps, OmittedProps> {
  first?: boolean,
  last?: boolean,
  purpose: string,
}
export const RowButton = (props: RowButtonProps) => {
  const { first, last, purpose, ...iconButtonProps } = props
  return (
    <IconButton
      size="xs"
      title={purpose}
      aria-label={purpose}
      borderStartRadius={first ? "" : "0"}
      borderEndRadius={last ? "" : "0"}
      borderLeft={first ? "" : "0"}
      {...iconButtonProps}
    />
  )
}

interface RowToggleButtonProps {
  text: string
  first?: boolean
  last?: boolean
  toggled?: boolean
  onClick: () => void
}
export const RowToggleButton = (props: RowToggleButtonProps) => {
  const { first, last, toggled, text, onClick } = props
  const color = toggled ? themed('buttonHovered') : themed('button')

  return (
    <Button
      size="xs"
      fontWeight="normal"
      bg={color}
      borderStartRadius={first ? "" : "0px"}
      borderEndRadius={last ? "" : "0px"}
      borderLeft={first ? "" : "0"}
      px="0.75rem"
      onClick={onClick}
    >
      {text}
    </Button>
  )
}
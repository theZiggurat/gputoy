import React from 'react'
import { 
  IconButton, 
  IconButtonProps, 
  Button,
  useColorModeValue
} from '@chakra-ui/react'


interface RowButtonProps {
  first?: boolean,
  last?: boolean,
  purpose: string,
}
export const RowButton = (props: RowButtonProps & IconButtonProps) => {
  const {first, last, purpose, ...iconButtonProps} = props
  return (
    <IconButton
      title={purpose}
      borderStartRadius={first?"":"0"}
      borderEndRadius={last?"":"0"}
      borderLeft={first?"":"0"}
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
  const {first, last, toggled, text, onClick} = props

  return (
    <Button
      fontWeight="thin"
      bg={toggled?'':useColorModeValue('whiteAlpha.600', 'whiteAlpha.50')}
      borderStartRadius={first?"":"0px"}
      borderEndRadius={last?"":"0px"}
      borderLeft={first?"":"0"}
      px="1rem"
      onClick={onClick}
    >
      {text}
    </Button>
  )
}
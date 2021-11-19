import React from 'react'
import { IconButton, IconButtonProps, Box, useCheckbox, Center } from '@chakra-ui/react'


interface RowButtonProps {
  first?: boolean,
  last?: boolean,
  purpose: string
}
export const RowButton = (props: RowButtonProps & IconButtonProps) => {
  const {first, last, purpose, ...iconButtonProps} = props
  return (
    <IconButton
      ariaLabel={purpose}
      title={purpose}
      size="sm"
      borderStartRadius={first?"":"0"}
      borderEndRadius={last?"":"0"}
      borderRight={last?"0px":"1px"}
      borderColor="blackAlpha.300"
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
    <Center 
      p={2}
      fontWeight="hairline"
      fontSize="smaller"
      textAlign="center"
      w="fit-content" 
      h="var(--chakra-sizes-8)" 
      backgroundColor={toggled?"whiteAlpha.200":"whiteAlpha.50"}
      _hover={{
        backgroundColor: "rgba(255, 255, 255, 0.16)"
      }}
      _active={{
        backgroundColor: "rgba(255, 255, 255, 0.24)"
      }}
      transitionProperty="var(--chakra-transition-property-common)"
      transitionDuration="var(--chakra-transition-duration-normal)"
      userSelect="none"
      borderRadius="var(--chakra-radii-md)"
      borderStartRadius={first?"":"0"}
      borderEndRadius={last?"":"0"}
      borderLeft={first?"0px":"1px"}
      borderColor="blackAlpha.300"
      onClick={onClick}
      //fontFamily='"Fira code", "Fira Mono", monospace'
    >
      {text}
    </Center>
  )
}
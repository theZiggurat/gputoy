import React from 'react'
import {Divider as ChakraDivider, useColorModeValue, DividerProps} from '@chakra-ui/react'

export const Divider = (props: DividerProps) => (
  <ChakraDivider borderColor={useColorModeValue('blackAlpha.300', 'whiteAlpha.300')} as={ChakraDivider} {...props}/>
)
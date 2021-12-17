import React from 'react'
import {Divider as ChakraDivider, useColorModeValue, DividerProps} from '@chakra-ui/react'
import { themed } from '../../theme/theme'

export const Divider = (props: DividerProps) => (
  <ChakraDivider borderColor={themed('divider')} as={ChakraDivider} {...props}/>
)
import React, { useEffect } from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from "@chakra-ui/react"

import { GPUInitResult } from '../gpu/gpu'

const ShdrAlert = (props: {gpuResult: GPUInitResult}) => {

  //const [show, setShow] = React.useState(false);

  
  const title = props.gpuResult === 'error' ? 
    'Something went wrong..':'Your browser is incompatible!'
  const desc = props.gpuResult === 'error' ?
    'WebGPU could not be initialized.':'Please use a WebGPU compatible browser for the full experience.'
  
  let shouldRender = props.gpuResult !== 'ok' 

  if(shouldRender) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>{title}</AlertTitle>
        <AlertDescription>{desc}</AlertDescription>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>)
  } else {
    return null
  }
}

export default ShdrAlert
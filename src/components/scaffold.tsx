import React, { ReactNode } from "react";
import { 
    chakra, 
    Flex,
    useColorModeValue,
  } from '@chakra-ui/react'
import Head from 'next/head'
import Nav from "./navbar";
import { lightResizer, darkResizer } from "../theme/consts";

const Scaffold = (props: {children: ReactNode, navChildren?: ReactNode}) => {
  
    return (
        <chakra.main display="flex" flexFlow="column" width="100%" height="100%" maxHeight="100%" overflow="hidden" sx={useColorModeValue(lightResizer, darkResizer)}>
            <Nav children={props.navChildren}/>
            { props.children }
        </chakra.main>
    )
}

export default Scaffold
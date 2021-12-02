import React, { ReactNode } from "react";
import { 
    chakra, 
    Flex,
  } from '@chakra-ui/react'
import Head from 'next/head'
import Nav from "./navbar";

const Scaffold = (props: {children: ReactNode, navChildren?: ReactNode}) => {
  
    return (
        <Flex flexFlow="column" width="100%" height="100%" maxHeight="100%" overflow="hidden">
            <Nav children={props.navChildren}/>
            { props.children }
        </Flex>
    )
}

export default Scaffold
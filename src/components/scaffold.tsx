import React, { ReactNode } from "react";
import { 
    chakra, 
    Flex,
  } from '@chakra-ui/react'
import Head from 'next/head'
import Nav from "./navbar";

const Scaffold = ({children}: {children: ReactNode}) => {
  
    return (
        <Flex flexFlow="column" width="100%" height="100%" maxHeight="100%" overflow="hidden">
            <Nav/>
            { children }
        </Flex>
    )
}

export default Scaffold
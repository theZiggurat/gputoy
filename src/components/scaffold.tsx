import React, { ReactNode } from "react";
import { 
    chakra, 
    Flex,
  } from '@chakra-ui/react'
import Head from 'next/head'
import Nav from "./navbar";

const Scaffold = ({children}: {children: ReactNode}) => {
  
    return (
        <chakra.div width="100%" height="100%">
          <Head>
              <title>GPUToy</title>
              <meta name="description" content="Create your imagination" />
              <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex flexFlow="column" height="100%">
              <Nav/>
                { children }
          </Flex>
        </chakra.div>
    )
}

export default Scaffold
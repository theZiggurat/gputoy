import React, { ReactNode } from "react";
import { 
    chakra, 
    Flex, 
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
  } from '@chakra-ui/react'
import Head from 'next/head'
import Nav from "./navbar";
import Footer from "./footer";

const FluiAlert = () => (
    <Alert color="white" status="error" height="3rem" backgroundColor="red.900" flex="0 0 auto">
      <AlertIcon color="red.400"/>
      <AlertTitle mr={2} backgroundColor="inherit">Your browser is outdated!</AlertTitle>
      <AlertDescription>
        &nbsp;Flui Requires WebGPU.
        Click&nbsp;
        <chakra.a href="https://caniuse.com/webgpu" fontWeight="bold">here</chakra.a> 
        &nbsp;to learn which browsers are compatable.
      </AlertDescription>
    </Alert>
  );

const Scaffold = ({children}: {children: ReactNode}) => {
    let gpu = true;
    if (typeof window !== "undefined") {
        gpu = window.navigator.gpu;
    }

    let welcomeCardSpacing = "4rem";
    if (!gpu) {
        welcomeCardSpacing = "7rem";
    }
  
    return (
        <chakra.div width="100%" height="100%">
          <Head>
              <title>Flui Home</title>
              <meta name="description" content="Create your imagination" />
              <link rel="icon" href="/favicon.ico" />
          </Head>
          <Flex flexFlow="column" height="100%">
              {
                  !gpu && <FluiAlert/>
              }
              <Nav/>
                { children }
              <Footer/> 
          </Flex>
        </chakra.div>
    )
}

export default Scaffold
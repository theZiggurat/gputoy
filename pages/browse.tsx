import React from 'react'
import { chakra, Text } from '@chakra-ui/react'
import Scaffold from '../src/components/scaffold'

const Create = () => {
    return (
        <Scaffold>
            <chakra.div height="100%" flexDirection="column" alignItems="center" textAlign="center" display="flex" justifyContent="center">
                <Text fontWeight="normal" fontSize={35}>Coming Soon</Text>
            </chakra.div>
        </Scaffold>
    )
}

export default Create;




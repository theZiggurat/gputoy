import React, { useEffect } from 'react'
import { chakra, Box, Text, Flex, useColorModeValue, Divider } from "@chakra-ui/react";
import Console, {Message} from '../../../gpu/console'

const colors = [
  "green",
  "white",
  "orange",
  "red"
]

const ConsolePanel = () => {

  const [text, setText] = React.useState(Console.getBuffer())

  useEffect(() => {
    Console.setOnMessage(() => {
      setText(Console.getBuffer())
    })
  }, [])
  

  return(
    <Flex 
      height="100%" 
      maxH="100%" 
      overflowY="hidden" 
      flexDir="column" 
      justify="space-between" 
      flexBasis="fill"
    >
      <Box 
        fontFamily='"Fira code", "Fira Mono", monospace' 
        fontSize="sm" 
        display="flex" 
        flexDirection="column" 
        overflowY="overlay"
        flex="1 1 auto"
        width="100%"
      >
        {text.map((message: Message, idx) => 
          <Flex 
            borderBottom="1px 
            solid" borderColor="whiteAlpha.200" 
            key={idx} 
            backgroundColor={idx%2==0?'':'blackAlpha.100'}
            dir="row"
          >
            <Box  p={2} flex="0 0 auto" color={colors[message.type]} fontWeight="bold">
              {message.header}:&nbsp;
            </Box>
            <Divider orientation="vertical"/>
            <Box p={2} flex="1 1 auto" whiteSpace="pre-wrap" >
              <Text>{message.body}</Text>
            </Box>
          </Flex>
        )}
      </Box>
      <Box 
        minHeight="70px" 
        backgroundColor={useColorModeValue('gray.150', 'gray.850')}
        flex="0 0 80"
      >
        Test
      </Box>
    </Flex>
  )
}
export default ConsolePanel
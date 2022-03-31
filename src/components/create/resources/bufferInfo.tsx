import { Flex } from "@chakra-ui/react";
import { BufferArgs } from "@core/types";
import { themed } from '@theme/theme'


const BufferInfo = (props: {
  args: BufferArgs,
  onChange: (args: BufferArgs) => void
}) => {



  return <Flex
    flex="1 1 auto"
    bg={themed('a2')}
  >

  </Flex>
}

export default BufferInfo
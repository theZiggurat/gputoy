import { chakra, HStack, Text } from '@chakra-ui/react'
import Scaffold from "../src/components/shared/scaffold"

const Market = () => {
  return <Scaffold>
    <chakra.div height="100%" flexDirection="column" alignItems="center" textAlign="center" display="flex" justifyContent="center">
      <Text fontWeight="normal" fontSize={35}>Coming Soon:</Text>
      <HStack>
        <Text fontWeight="light" fontSize={20}>Add extra functionality to your shaders in one click.</Text>
      </HStack>
    </chakra.div>
  </Scaffold>
}

export default Market
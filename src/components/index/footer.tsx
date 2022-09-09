import {
    chakra, Flex, Text,
    useColorModeValue
} from "@chakra-ui/react";
import {
    AiFillGithub, AiFillRedditCircle, AiFillTwitterCircle
} from "react-icons/ai";
import { themed } from "theme/theme";

const Footer = () => {
  return (
    <chakra.footer bg={themed("bg")}>
      <Flex
        flexDir="row"
        justifyContent="center"
        py="5rem"
        gridGap="10vw"
        flexWrap="wrap"
        borderTop="1px"
        borderColor={themed("borderLight")}
      >
        <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
          <Text
            fontSize="2rem"
            fontWeight="extrabold"
            cursor="pointer"
            color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
            lineHeight="2rem"
          >
            GPUTOY
          </Text>
          <Flex gridGap="0.5rem" pt="1rem">
            <AiFillTwitterCircle size={30} />
            <AiFillRedditCircle size={30} />
            <AiFillGithub size={30} />
          </Flex>
        </Flex>
        <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
          <Text
            fontSize="1.2rem"
            pb="0.5rem"
            color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
            fontWeight="bold"
          >
            Resources
          </Text>
          <Text fontSize="1rem">Tutorial</Text>
          <Text fontSize="1rem">Documentation</Text>
        </Flex>
        <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
          <Text
            fontSize="1.2rem"
            pb="0.5rem"
            color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
            fontWeight="bold"
          >
            About
          </Text>
          <Text fontSize="1rem">About us</Text>
          <Text fontSize="1rem">Roadmap</Text>
        </Flex>
        <Flex flexDir="column" alignItems="self-start" gridGap="0.3rem">
          <Text
            fontSize="1.2rem"
            pb="0.5rem"
            color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}
            fontWeight="bold"
          >
            Contact
          </Text>
          <Text fontSize="1rem">Email us</Text>
          <Text fontSize="1rem">Submit an issue</Text>
        </Flex>
      </Flex>
      {/* Will be implemented in the future when I know how to */}
      {/* <HStack gridGap="10rem" margin="auto" justifyContent="center">
        <Text fontSize="0.8rem" py="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}>
          Privacy Policy
        </Text>
        <Text fontSize="0.8rem" py="0.5rem" color={useColorModeValue("blackAlpha.700", "whiteAlpha.700")}>
          Terms of Service
        </Text>
      </HStack> */}
    </chakra.footer>
  );
};

export default Footer;

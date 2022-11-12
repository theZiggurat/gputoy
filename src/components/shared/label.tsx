import { Box, chakra, Flex, FlexProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import { themed } from "theme/theme";

type LabelProps = {
  text: string;
  children: ReactNode;
};
const Label = (props: LabelProps & FlexProps) => {
  const { text, children, ...flexProps } = props;
  return (
    <Flex
      fontSize="sm"
      justifyContent="space-between"
      alignItems="center"
      {...flexProps}
    >
      <chakra.span
        fontWeight="semibold"
        color={themed("textMidLight")}
        fontSize={props["fontSize"] ?? "xs"}
      >
        {text}
      </chakra.span>
      <Box>{children}</Box>
    </Flex>
  );
};

export default Label;

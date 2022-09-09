import { Divider as ChakraDivider, DividerProps } from "@chakra-ui/react";
import React from "react";
import { themed } from "../../../theme/theme";

export const Divider = (props: DividerProps) => (
  <ChakraDivider
    borderColor={themed("divider")}
    as={ChakraDivider}
    {...props}
  />
);

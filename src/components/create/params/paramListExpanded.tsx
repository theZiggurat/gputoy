import { Flex } from "@chakra-ui/react";
import ParamEntry from "./paramEntry";
import { ParamInterface } from "./paramInterface";

type ParamListExpandedProps = {
  keys: string[];
  onChangeSelected: (k: string) => void;
  selectedParam: string | null;
};

const ParamListExpanded = (props: ParamListExpandedProps) => {
  const error = false;

  return (
    <Flex flexDir="row" height="100%" overflow="hidden">
      <Flex
        flexDir="column"
        flex="1 1 auto"
        overflow="scroll"
        height="100%"
        py="0.5rem"
      >
        {props.keys.map((k) => (
          <ParamEntry
            height="2.3rem"
            minH="2.3rem"
            key={k}
            paramKey={k}
            onSelect={props.onChangeSelected}
            highlight={props.selectedParam == k}
            showField={false}
            outline={error ? "1px solid #EE252550" : ""}
          />
        ))}
      </Flex>
      {props.selectedParam && (
        <ParamInterface
          selectedParam={props.selectedParam}
          maxW="30rem"
          maxH="30rem"
          minH="10rem"
          minW="10rem"
          flex="0 0 auto"
        />
      )}
    </Flex>
  );
};

export default ParamListExpanded;

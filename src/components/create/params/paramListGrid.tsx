import { Flex } from "@chakra-ui/layout";
import Draggable from "react-draggable"; // Both at the same time
import { ParamInterface } from "./paramInterface";

type ParamListGridProps = {
  keys: string[];
  onChangeSelected: (k: string) => void;
  selectedParam: string | null;
};
const ParamListGrid = (props: ParamListGridProps) => {
  const error = false;
  return (
    <Flex flexDir="row" height="100%">
      {/* <Flex flexDir="column" flex="1 1 auto" overflow="scroll" height="100%" py="0.5rem">
      {
        props.keys.map(k => <ParamEntry
          key={k}
          paramKey={k}
          onSelect={props.onChangeSelected}
          highlight={props.selectedParam == k}
          showField={false}
          outline={error ? "1px solid #EE252550" : ""}
        />)
      }
    </Flex> */}
      <Flex width="100%" height="100%">
        {props.keys.map((k) => (
          <Draggable key={k} grid={[32, 32]}>
            <ParamInterface selectedParam={k} width={250} />
          </Draggable>
        ))}
      </Flex>
    </Flex>
  );
};

export default ParamListGrid;

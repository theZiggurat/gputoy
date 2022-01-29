import { ParamInterface } from "./paramInterface"
import React from "react"
import ParamEntry from "./paramEntry"
import { Flex, Box, Text } from "@chakra-ui/react"

type ParamListExpandedProps = {
  keys: string[]
  onChangeSelected: (k: string) => void
  selectedParam: string | null,
}



const ParamListExpanded = (props: ParamListExpandedProps) => {

  const error = false

  return <Flex flexDir="row" height="100%">
    <Flex flexDir="column" flex="1 1 auto" overflow="scroll" height="100%" py="0.5rem">
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
    </Flex>
    {
      props.selectedParam &&
      <ParamInterface selectedParam={props.selectedParam} />
    }

  </Flex>
}

export default ParamListExpanded
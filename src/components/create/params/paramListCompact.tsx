import React from "react"
import ParamEntry from "./paramEntry"

type ParamListCompactProps = {
  keys: string[]
  onChangeSelected: (k: string) => void
  selectedParam: string | null,
}

const ParamListCompact = (props: ParamListCompactProps) => {
  return <>
    {props.keys.map(k => <ParamEntry key={k} paramKey={k} onSelect={props.onChangeSelected} flexDir="column" />)}
  </>
}

export default ParamListCompact
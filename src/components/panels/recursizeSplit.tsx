import React from 'react'
import SplitPane from 'react-split-pane'
import {chakra} from '@chakra-ui/react'

const MAX_RECURSION = 3

interface RecursizeSplitPaneProps {
  tree: string[]
  location: string,
  level: number,
}
const RecursizeSplitPane = (props: RecursizeSplitPaneProps) => {

  const branch = props.tree.filter(s => s.startsWith(props.location))
  const dir = branch.find()

  return (
    <SplitPane>
      {
        branch.length == 1 &&
          <chakra.div backgroundColor='red'/>
      }
      {
        branch.length > 1 &&
          <RecursizeSplitPane
            tree={props.tree}
            location={props.location.concat(branch)}
          />
      }
    </SplitPane>
  )

}
import React, { } from "react"
import { themed } from "@theme/theme"
import { Panel, PanelBar, PanelContent, PanelInProps } from "../panel"
import Accordion from '@components/shared/accordion'
import SummaryInfo from '@components/create/summary/summaryInfo'
import SummaryFiles from '@components/create/summary/summaryFiles'


const SummaryPanel = (props: PanelInProps) => {

  return (
    <Panel {...props}>
      <PanelContent>
        <Accordion title="Shader Info" initOpen first bg={themed('bg')}>
          <SummaryInfo />
        </Accordion>
        <Accordion title="Files" bg={themed('a3')} w="100%">
          <SummaryFiles instanceId={props.instanceID} />
        </Accordion>
        <Accordion title="Pipelines">

        </Accordion>
        <Accordion title="Project Settings" last>

        </Accordion>
      </PanelContent>
      <PanelBar>
      </PanelBar>
    </Panel>
  )
}

export default SummaryPanel
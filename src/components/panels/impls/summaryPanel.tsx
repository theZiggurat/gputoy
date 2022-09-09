import SummaryFiles from "@components/create/summary/summaryFiles";
import SummaryInfo from "@components/create/summary/summaryInfo";
import SummaryResources from "@components/create/summary/summaryResources";
import Accordion from "@components/shared/accordion";
import useInstance from "@core/hooks/useInstance";
import { themed } from "@theme/theme";
import { SummaryInstanceState } from "../descriptors";
import { Panel, PanelBar, PanelContent, PanelInProps } from "../panel";

const SummaryPanel = (props: PanelInProps) => {
  const [instanceState, setInstanceState] =
    useInstance<SummaryInstanceState>(props);
  const { panelOpenState } = instanceState;

  const onHandleToggleOpen = (idx: number) => {
    setInstanceState((o) => {
      let newPanelOpenState = [...o.panelOpenState];
      newPanelOpenState[idx] = !newPanelOpenState[idx];
      return {
        ...o,
        panelOpenState: newPanelOpenState,
      };
    });
  };

  return (
    <Panel {...props}>
      <PanelContent>
        <Accordion
          title="Shader Info"
          open={panelOpenState[0]}
          onToggleOpen={() => onHandleToggleOpen(0)}
          first
          bg={themed("bg")}
        >
          <SummaryInfo />
        </Accordion>
        <Accordion
          title="Files"
          open={panelOpenState[1]}
          onToggleOpen={() => onHandleToggleOpen(1)}
          bg={themed("a3")}
          w="100%"
        >
          <SummaryFiles instanceId={props.instanceID} />
        </Accordion>
        <Accordion
          title="Resources"
          open={panelOpenState[2]}
          onToggleOpen={() => onHandleToggleOpen(2)}
          bg={themed("a3")}
          w="100%"
        >
          <SummaryResources instanceId={props.instanceID} />
        </Accordion>
        <Accordion
          title="Project Settings"
          open={panelOpenState[3]}
          onToggleOpen={() => onHandleToggleOpen(3)}
          last
        ></Accordion>
      </PanelContent>
      <PanelBar></PanelBar>
    </Panel>
  );
};

export default SummaryPanel;

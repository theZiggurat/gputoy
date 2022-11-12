import React from "react";
import { Panel, PanelBar, PanelContent } from "../panel";

const BlankPanel = (props) => {
  return (
    <Panel {...props}>
      <PanelContent></PanelContent>
      <PanelBar></PanelBar>
    </Panel>
  );
};

export default BlankPanel;

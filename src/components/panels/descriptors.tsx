import * as types from "@core/types";
import React from "react";
import {
    BsFillFileEarmarkCodeFill,
    BsFillFileSpreadsheetFill,
    BsTerminalFill
} from "react-icons/bs";
import { FaBorderNone } from "react-icons/fa";
import { IoTvSharp } from "react-icons/io5";
import { MdSummarize } from "react-icons/md";
import { VscLayers } from "react-icons/vsc";
import BlankPanel from "./impls/blankPanel";
import ConsolePanel from "./impls/consolePanel";
import EditorPanel from "./impls/editorPanel";
import ParamPanel from "./impls/paramPanel";
import ResourcePanel from "./impls/resourcePanel";
import SummaryPanel from "./impls/summaryPanel";
import ViewportPanel from "./impls/viewPanel";

export interface ParamInstanceState {
  keywordFilter: string;
  nameErrors: boolean[];
  selectedParam: string;
}
export interface ConsoleInstanceState {
  typeFilters: boolean[];
  keywordFilter: string;
}
export interface EditorInstanceState {
  currentFileIndex?: number;
  workspace: string[];
}
export interface ViewportInstanceState {
  showInfo: boolean;
}

export interface SummaryInstanceState {
  panelOpenState: boolean[];
}

export interface ResourceInstanceState {
  openResource?: string;
}

export interface PanelDescriptor {
  index: number;
  name: string;
  icon: React.ReactElement<any>;
  component: React.FC<any>;
  single?: boolean;
  defaultInstanceProps: types.InstanceState;
}

export default [
  {
    index: 0,
    name: "_Blank",
    icon: <FaBorderNone />,
    component: BlankPanel,
    defaultInstanceProps: {},
  },
  {
    index: 1,
    name: "Viewport",
    icon: <IoTvSharp />,
    component: ViewportPanel,
    single: true,
    defaultInstanceProps: {
      showInfo: false,
    },
  },
  {
    index: 2,
    name: "Params",
    icon: <BsFillFileSpreadsheetFill />,
    component: ParamPanel,
    defaultInstanceProps: {
      keywordFilter: "",
      nameErrors: [],
    },
  },
  {
    index: 3,
    name: "Editor",
    icon: <BsFillFileEarmarkCodeFill />,
    component: EditorPanel,
    defaultInstanceProps: {
      currentFileIndex: undefined,
      workspace: [],
    },
  },
  {
    index: 4,
    name: "Console",
    icon: <BsTerminalFill />,
    component: ConsolePanel,
    defaultInstanceProps: {
      keywordFilter: "",
      typeFilters: [true, true, true, true, true],
    },
  },
  {
    index: 5,
    name: "Summary",
    icon: <MdSummarize />,
    component: SummaryPanel,
    defaultInstanceProps: {
      panelOpenState: [true, true, true, false],
    },
  },
  {
    index: 6,
    name: "Resources",
    icon: <VscLayers />,
    component: ResourcePanel,
    defaultInstanceProps: {},
  },
] as PanelDescriptor[];

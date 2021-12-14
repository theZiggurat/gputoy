import React from "react"
import { BsFillFileSpreadsheetFill, BsFillFileEarmarkCodeFill, BsTerminalFill } from "react-icons/bs"
import { FaBorderNone } from "react-icons/fa"
import {IoTvSharp} from 'react-icons/io5'
import BlankPanel from "./impls/blankPanel"
import ConsolePanel from "./impls/consolePanel"
import EditorPanel from "./impls/editorPanel"
import ParamPanel from "./impls/paramPanel"
import ViewportPanel from "./impls/viewPanel"
import { PanelDescriptor } from "./panel"

export default [
  {
		index: 0, 
		name: '_Blank', 
		icon: <FaBorderNone/>, 
		component: BlankPanel, 
  },
  {
    index: 1, 
    name: 'Viewport', 
    icon: <IoTvSharp/>, 
    component: ViewportPanel, 
    single: true
	},
  {
		index: 1, 
		name: 'Params', 
		icon: <BsFillFileSpreadsheetFill/>, 
		component: ParamPanel, 
  },
  {
		index: 2, 
		name: 'Editor', 
		icon: <BsFillFileEarmarkCodeFill/>, 
		component: EditorPanel, 
  },
  {
		index: 3, 
		name: 'Console', 
		icon: <BsTerminalFill/>, 
		component: ConsolePanel, 
  }
] as PanelDescriptor[]
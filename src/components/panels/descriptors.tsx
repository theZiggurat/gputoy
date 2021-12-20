import React from "react"
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from "react-icons/bs"
import { FaBorderNone } from "react-icons/fa"
import { IoTvSharp } from 'react-icons/io5'
import { MdSummarize } from "react-icons/md"
import BlankPanel from "./impls/blankPanel"
import ConsolePanel from "./impls/consolePanel"
import EditorPanel from "./impls/editorPanel"
import ParamPanel from "./impls/paramPanel"
import SummaryPanel from "./impls/summaryPanel"
import ViewportPanel from "./impls/viewPanel"

export type InstanceState = any

export interface ParamInstanceState {
	keywordFilter: string,
	nameErrors: boolean[]
}
export interface ConsoleInstanceState {
	typeFilters: boolean[]
	keywordFilter: string
}
export interface EditorInstanceState {
	currentFileIndex: number
}
export interface PanelDescriptor {
	index: number
	name: string,
	icon: React.ReactElement<any>,
	component: React.FC<any>,
	single?: boolean,
	defaultInstanceProps: InstanceState
}

export default [
	{
		index: 0,
		name: '_Blank',
		icon: <FaBorderNone />,
		component: BlankPanel,
		defaultInstanceProps: {}
	},
	{
		index: 1,
		name: 'Viewport',
		icon: <IoTvSharp />,
		component: ViewportPanel,
		single: true,
		defaultInstanceProps: {}
	},
	{
		index: 1,
		name: 'Params',
		icon: <BsFillFileSpreadsheetFill />,
		component: ParamPanel,
		defaultInstanceProps: {
			keywordFilter: '',
			nameErrors: []
		}
	},
	{
		index: 2,
		name: 'Editor',
		icon: <BsFillFileEarmarkCodeFill />,
		component: EditorPanel,
		defaultInstanceProps: {
			currentFileIndex: 0
		}
	},
	{
		index: 3,
		name: 'Console',
		icon: <BsTerminalFill />,
		component: ConsolePanel,
		defaultInstanceProps: {
			keywordFilter: '',
			typeFilters: [true, true, true, true, false]
		}
	},
	{
		index: 4,
		name: 'Summary',
		icon: <MdSummarize />,
		component: SummaryPanel,
		defaultInstanceProps: {}
	}
] as PanelDescriptor[]
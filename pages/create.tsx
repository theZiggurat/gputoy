import React from 'react'
import { Panels, usePanels, PanelDescriptor } from '../src/components/panels/panel'
import Scaffold from '../src/components/scaffold'

import ViewportPanel, { useViewportPanel } from '../src/components/panels/impls/viewPanel'
import ParamPanel, { useParamsPanel } from '../src/components/panels/impls/paramPanel'
import EditorPanel, { useEditorPanel } from '../src/components/panels/impls/editorPanel'
import ConsolePanel from '../src/components/panels/impls/consolePanel'

import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'


export interface ProjectStatus {
    gpustatus: string,
    fps: string,
    time: string,
}

const Create = () => {
    
    const editorProps = useEditorPanel()
    const paramProps = useParamsPanel()
    const viewportProps = useViewportPanel()

    const props = usePanels()

    const panelDesc: PanelDescriptor[] = [
        {
            index: 0, 
            name: 'Viewport', 
            icon: <FaBorderNone/>, 
            component: ViewportPanel, 
            staticProps: viewportProps,
        },
        {
            index: 1, 
            name: 'Params', 
            icon: <BsFillFileSpreadsheetFill/>, 
            component: ParamPanel, 
            staticProps: paramProps,
        },
        {
            index: 2, 
            name: 'Editor', 
            icon: <BsFillFileEarmarkCodeFill/>, 
            component: EditorPanel, 
            staticProps: editorProps,
        },
        {
            index: 3, 
            name: 'Console', 
            icon: <BsTerminalFill/>, 
            component: ConsolePanel, 
            staticProps: {},
        }
    ]
    
    return (
        <Scaffold>
            <Panels {...props} descriptors={panelDesc}/>
        </Scaffold>
    )
}

export default Create

import React, { useEffect, useRef } from 'react'
import { Panels, usePanels, PanelDescriptor } from '../src/components/panels/panel'
import Scaffold from '../src/components/scaffold'

import ViewportPanel from '../src/components/panels/impls/viewPanel'
import ParamPanel from '../src/components/panels/impls/paramPanel'
import EditorPanel from '../src/components/panels/impls/editorPanel'
import ConsolePanel from '../src/components/panels/impls/consolePanel'

import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'
import { Project } from '../src/gpu/project'
import ProjectManager from '../src/components/projectManager'


// function useTraceUpdate(props) {
//     const prev = useRef(props);
//     useEffect(() => {
//       const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
//         if (prev.current[k] !== v) {
//           ps[k] = [prev.current[k], v];
//         }
//         return ps;
//       }, {});
//       if (Object.keys(changedProps).length > 0) {
//         console.log('Changed props:', changedProps);
//       }
//       prev.current = props;
//     });
// }

const panelDesc: PanelDescriptor[] = [
    {
        index: 0, 
        name: 'Viewport', 
        icon: <FaBorderNone/>, 
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
]

const Create = () => {

    const props = usePanels()
    
    return (
        <Scaffold>
            <Panels {...props} descriptors={panelDesc}/>
        </Scaffold>
    )
}

export default Create

import React, { useEffect } from 'react'
import { 
    chakra, 
    Box,
    Button,
} from '@chakra-ui/react'

import Scaffold from '../src/components/scaffold'
import SplitPane from 'react-split-pane'

import ViewportPanel from '../src/components/panels/viewPanel'
import ParamPanel, { useParamsPanel } from '../src/components/panels/paramPanel'
import ConsolePanel from '../src/components/panels/consolePanel'
import EditorPanel, { useEditorPanel } from '../src/components/panels/editorPanel'

import WorkingProject from '../src/gpu/project'
import {ParamDesc} from '../src/gpu/params'
import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'
import usePanels, {PanelDescriptor} from '../src/components/panels/panelHook'


export interface ProjectStatus {
    gpustatus: string,
    fps: string,
    time: string,
}

const Create = () => {

    const [ready, setReady] = React.useState(false)
    const [dirty, setDirty] = React.useState(true)


    const [editedTab, setEditedTab] = React.useState(-1)

    
    const [projectStatus, setProjectStatus] = React.useState<ProjectStatus>({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

    const editorProps = useEditorPanel()
    const paramProps = useParamsPanel()

    

    const panelDesc: PanelDescriptor[] = [
        {
            index: 0, 
            name: 'Viewport', 
            icon: <FaBorderNone/>, 
            component: ViewportPanel, 
            staticProps: {
                onRequestStart: () => {WorkingProject.run()},
                onRequestPause: WorkingProject.pause,
                onRequestStop: WorkingProject.stop,
                projectStatus: projectStatus,
            },
            defaultDynProps: {}
        },
        {
            index: 1, 
            name: 'Params', 
            icon: <BsFillFileSpreadsheetFill/>, 
            component: ParamPanel, 
            staticProps: paramProps,
            defaultDynProps: {}
        },
        {
            index: 2, 
            name: 'Editor', 
            icon: <BsFillFileEarmarkCodeFill/>, 
            component: EditorPanel, 
            staticProps: editorProps,
            defaultDynProps: {workspace: [], currentFile: -1}
        },
        {
            index: 3, 
            name: 'Console', 
            icon: <BsTerminalFill/>, 
            component: ConsolePanel, 
            staticProps: {},
            defaultDynProps: {}
        }
    ]

    const [panelTree, panelProps] = usePanels(panelDesc, {
        type: 'vertical',
        left: {
            type: 'horizontal',
            left: {
                type: 'leaf',
                index: 0
            },
            right: {
                type: 'leaf',
                index: 3
            }
        },
        right: {
            type: 'leaf',
            index: 2
        }
    })

    /**
     * Status panel periodic update
     */
    useEffect(() => {
        // const id = setInterval(() => {
        //     let fps = '--'
        //     if (WorkingProject.dt != 0) {
        //         fps = (1 / WorkingProject.dt * 1000).toFixed(2).toString()
        //     }

        //     setProjectStatus(oldStatus => {
        //         let newStatus = {
        //             gpustatus: WorkingProject.status,
        //             fps: fps,
        //             time: (WorkingProject.runDuration).toFixed(1).toString()
        //         }
        //         return newStatus
        //     })
        // },(100))
        // return () => clearInterval(id)
    },[])


    return (
        <Scaffold>
        {
            panelTree.render(panelDesc, {...panelProps, panelDesc})
        }
        </Scaffold>
    )
}

export default Create;

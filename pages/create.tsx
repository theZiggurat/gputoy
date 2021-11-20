import React, { useEffect, useState } from 'react'

import Scaffold from '../src/components/scaffold'

import ViewportPanel from '../src/components/panels/impls/viewPanel'
import ParamPanel, { useParamsPanel } from '../src/components/panels/impls/paramPanel'
import ConsolePanel from '../src/components/panels/impls/consolePanel'
import EditorPanel, { useEditorPanel } from '../src/components/panels/impls/editorPanel'

import WorkingProject from '../src/gpu/project'
import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'
import {Panels, usePanels, PanelDescriptor } from '../src/components/panels/panelHook'


export interface ProjectStatus {
    gpustatus: string,
    fps: string,
    time: string,
}

const Create = () => {
    
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
    
    const props = usePanels()

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
            <Panels {...props} descriptors={panelDesc}/>
        </Scaffold>
    )
}

export default Create

import React, { useEffect } from 'react'
import { 
    chakra, 
    Box,
    Button,
} from '@chakra-ui/react'

import Scaffold from '../src/components/scaffold'
import SplitPane from 'react-split-pane'

import ViewportPanel from '../src/components/panels/viewPanel'
import ParamPanel from '../src/components/panels/paramPanel'
import ConsolePanel from '../src/components/panels/consolePanel'
import EditorPanel, {useEditor} from '../src/components/panels/editorPanel'

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

    const [params, setParams] = React.useState<ParamDesc[]>([])
    const [projectStatus, setProjectStatus] = React.useState<ProjectStatus>({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

    const editorProps = useEditor()

    const setParamAtIndex = (p: ParamDesc, idx: number, changedType: boolean) => {

        if (changedType) {
            if (p.paramType === 'color') {
                p.param = [1, 0, 0]
            } else {
                p.param = [0]
            }
        }

        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams[idx] = p
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
    }

    const addNewParam = () => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.push({
                paramName: `param${newParams.length}`,
                paramType: 'int',
                param: [0]
            })
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
        
    }

    const deleteParam = (idx: number) => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.splice(idx, 1)
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
    }

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
            staticProps: {
                onParamChange: WorkingProject.setParams,
                params: params,
                setParamAtIndex: setParamAtIndex,
                addNewParam: addNewParam,
                deleteParam: deleteParam
            },
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

    const [panelTree, dynPropTable, panelProps] = usePanels(panelDesc, {
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
     * On param state change
     */
    useEffect(() => {
        //WorkingProject.setParams(params, true)
    }, [params])

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

    /**
     * Local storage param loading
     */
    useEffect(() => {
        let params = window.localStorage.getItem('params')
        if (params) 
            setParams(JSON.parse(params))
    }, [])
    

    return (
        <Scaffold>
        {
            panelTree.render(panelDesc, dynPropTable, {...panelProps, panelDesc})
        }
        </Scaffold>
    )
}

export default Create;

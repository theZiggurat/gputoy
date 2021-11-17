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
import EditorPanel from '../src/components/panels/editorPanel'

import WorkingProject from '../src/gpu/project'
import {ParamDesc} from '../src/gpu/params'
import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'
import usePanels, {PanelDescriptor} from '../src/components/panels/panelHook'

//import basicShader from '../shaders/basicShader.wgsl'

export interface CodeFile {
    filename: string,
    file: string,
}

export interface ProjectStatus {
    gpustatus: string,
    fps: string,
    time: string,
}

export type CodeFiles = CodeFile[]

const panelDesc: PanelDescriptor[] = [
    {index: 0, name: 'Viewport', icon: <FaBorderNone/>, component: ViewportPanel},
    {index: 1, name: 'Params', icon: <BsFillFileSpreadsheetFill/>, component: ParamPanel},
    {index: 2, name: 'Editor', icon: <BsFillFileEarmarkCodeFill/>, component: EditorPanel},
    {index: 3, name: 'Console', icon: <BsTerminalFill/>, component: ConsolePanel}
]

const Create = () => {

    const [ready, setReady] = React.useState(false)
    const [dirty, setDirty] = React.useState(true)

    const [codeFiles, setCodeFiles] = React.useState<CodeFiles>([])
    const [editedTab, setEditedTab] = React.useState(-1)
    const [currentFile, setCurrentFile] = React.useState(-1)

    const [params, setParams] = React.useState<ParamDesc[]>([])
    const [projectStatus, setProjectStatus] = React.useState<ProjectStatus>({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

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
     * Canvas init
     */
    useEffect(() => {
        const initCanvas = async () => {
            await WorkingProject.attachCanvas('canvas')
            let status = WorkingProject.status
            if (status === 'Ok')
                setReady(true)
        }
        initCanvas()
    }, [])

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

     /**
     * Local storage file loading
     */
      useEffect(() => {
        let storedFiles = window.localStorage.getItem('files');
        if (storedFiles) 
            setCodeFiles(JSON.parse(storedFiles))
    }, [])

    /**
     * Local storage file saving
     */
    useEffect(() => {
       window.localStorage.setItem('files', JSON.stringify(codeFiles))
    }, [codeFiles])

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

    const onEditorCodeChange = (idx: number, code: string, filename: string) => {
        setCodeFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx] = {
                filename: filename,
                file: code
            }
            return updated
        })
        setCurrentFile(idx)
        setDirty(true)
    }

    const createNewFile = () => {
        let idx = 0
        while (codeFiles.map((c) => c.filename).includes(`shader${idx}.wgsl`)) 
            ++idx
        onEditorCodeChange(codeFiles.length, "", `shader${idx}.wgsl`)
    }

    const deleteFile = (idx: number) => {
        setCodeFiles(prevCode => {
            let updated = [...prevCode]
            updated.splice(idx, 1)
            return updated
        })
    }

    const panels = [
        <ViewportPanel
            onRequestStart={() => {
                if (dirty) {
                    WorkingProject.setShaderSrc(codeFiles[currentFile].file)
                    setDirty(false)
                }
                WorkingProject.run()
            }}
            onRequestPause={WorkingProject.pause}
            onRequestStop={WorkingProject.stop}
            projectStatus={projectStatus}
            disabled={!ready}
        />,
        <ParamPanel
            onParamChange={WorkingProject.setParams}
            params={params}
            setParamAtIndex={setParamAtIndex}
            addNewParam={addNewParam}
            deleteParam={deleteParam}
        />,
        <EditorPanel 
            codeFiles={codeFiles}
            editedTab={editedTab}
            currentFile={currentFile}
            onEditorCodeChange={onEditorCodeChange}
            createNewFile={createNewFile}
            deleteFile={deleteFile}
            setCurrentFile={setCurrentFile}
        />,
        <ConsolePanel/>
    ]

    return (
        <Scaffold>
        {
            panelTree.render(panels, '', {...panelProps, panelDesc})
        }
        </Scaffold>
    )
}

export default Create;


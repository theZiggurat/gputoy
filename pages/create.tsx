import React, { useEffect } from 'react'
import { 
    chakra, 
    Box,
    Button,
} from '@chakra-ui/react'

import Scaffold from '../src/components/scaffold'
import SplitPane from 'react-split-pane'

import CanvasPanel from '../src/components/panels/viewPanel'
import ParamPanel from '../src/components/panels/paramPanel'
import ConsolePanel from '../src/components/panels/consolePanel'
import EditorPanel from '../src/components/panels/editorPanel'

import WorkingProject from '../src/gpu/project'
import {ParamDesc} from '../src/gpu/params'
import { FaBorderNone } from 'react-icons/fa'
import { BsFillFileEarmarkCodeFill, BsFillFileSpreadsheetFill, BsTerminalFill } from 'react-icons/bs'

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

export interface PanelDescriptor {
    index: number
    name: string,
    icon: React.ReactElement<any>,
}

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

    const [panelTree, setPanelTree] = React.useState(construct({
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
    }))  

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
        WorkingProject.setParams(params, true)
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

    const onTabDoubleClick = (idx: number) => setEditedTab(idx)
    const onFinishedEditingTab = () => setEditedTab(-1)
    const onTabNameChanged = (ev, idx: number) => {
        setCodeFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx].filename = ev.target.value
            return updated
        })
    }

    const onSplit = (path: string, direction: 'horizontal' | 'vertical') => {
        console.log("splitting", path, direction)
    }
    const onCombine= (path: string) => {
        console.log('combining', path)
    }



    const forceUpdate = () => {
        setPanelTree(panelTree.clone())
    }

    

    const panels = [
        <CanvasPanel
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
            onTabDoubleClick={onTabDoubleClick}
            onFinishEditingTab={onFinishedEditingTab}
            onTabNameChanged={onTabNameChanged}
            setCurrentFile={setCurrentFile}
        />,
        <ConsolePanel/>
    ]

    const panelDesc: PanelDescriptor[] = [
        {index: 0, name: 'Viewport', icon: <FaBorderNone/>},
        {index: 1, name: 'Params', icon: <BsFillFileSpreadsheetFill/>},
        {index: 2, name: 'Editor', icon: <BsFillFileEarmarkCodeFill/>},
        {index: 3, name: 'Console', icon: <BsTerminalFill/>}
    ]

    console.log(panelDesc)

    return (
        <Scaffold>
        {
            panelTree.render(panels, '', 
                {
                    onSplit: onSplit,
                    onCombine: onCombine,
                    panelDesc: panelDesc,
                }
            )
        }
            {/* <Button position='absolute' left='500px' top='500px' onClick={onSplit}>
                Test
            </Button> */}
        </Scaffold>
    )
}
export default Create;

type TreeType = 'vertical' | 'horizontal' | 'leaf'
const err1 = () => <Box width="100%" height="100%" backgroundColor="orange"/>
const err2 = () => <Box width="100%" height="100%" backgroundColor="red"/>
class Tree {
    type: TreeType
    index: number
    left?: Tree
    right?: Tree

    constructor(type: TreeType, index: number = -1) {
        this.type = type
        this.index = index
    }

    render(panels: JSX.Element[], path: string, props: any): React.ReactElement<any> {
        if (this.type == 'leaf')
            return panels.length <= this.index ? <err1/>: 
                React.cloneElement(
                    panels[this.index], 
                    {...props, path: path, panelIndex: this.index}
                )
        else if (this.left && this.right)
            return React.createElement(
                SplitPane,
                {
                    split: this.type, 
                    defaultSize: "60%", 
                    style: path=='' ? {
                        flex: '1 1 auto',
                        position: 'relative'
                    } : {}
                },
                [this.left.render(panels, path.concat('l'), props), this.right.render(panels, path.concat('r'), props)]
            )
        else 
            return <err2/>
    }

    clone(): Tree {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }
}

const construct = (obj: any): Tree => {
    let ret
    ret = new Tree(obj['type'], obj['index'])
    ret.left = 'left' in obj ? construct(obj['left']) : undefined
    ret.right = 'right' in obj ? construct(obj['right']) : undefined
    return ret
}


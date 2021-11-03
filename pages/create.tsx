import React, { useEffect } from 'react'
import { 
    chakra, 
} from '@chakra-ui/react'
import Scaffold from '../src/components/scaffold'
import Canvas from '../src/components/canvas'
import CodeEditor from '../src/components/create/editor'
import SplitPane from 'react-split-pane'
import ParamsPanel from '../src/components/create/paramspanel'
import WorkingProject from '../src/gpu/project'

import basicShader from '../shaders/basicShader.wgsl'

interface CodeFile {
    filename: string,
    file: string,
}
export type CodeFiles = CodeFile[]

const Create = () => {

    const [ready, setReady] = React.useState(false)

    const [codeFiles, setCodeFiles] = React.useState<CodeFiles>([])
    const [editedTab, setEditedTab] = React.useState(-1)
    const [currentFile, setCurrentFile] = React.useState(-1)

    useEffect(() => {
        let filenames = window.localStorage.getItem("files");
        if (filenames != null) {
            let codefiles: CodeFiles = [];
            filenames.split(',').forEach((filename, idx)=> {
                let file = window.localStorage.getItem(filename);
                if (file != null) {
                    codefiles[idx] = {
                        filename: filename,
                        file: file
                    }
                }
            })
            setCodeFiles(codefiles)
        }
    }, [])

    const onEditorCodeChange = (idx: number, code: string, filename: string) => {
        window.localStorage.setItem(filename, code)
        setCodeFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx] = {
                filename: filename,
                file: code
            }
            return updated
        })
        setCurrentFile(idx)
    }

    const createNewFile = () => {
        let idx = 0
        while (codeFiles.map((c) => c.filename).includes(`shader${idx}.wgsl`)) 
            ++idx
        onEditorCodeChange(codeFiles.length, basicShader, `shader${idx}.wgsl`)
    }

    const deleteFile = (idx) => {
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

    useEffect(() => {
        const initCanvas = async () => {
            await WorkingProject.attachCanvas('canvas')
            let status = WorkingProject.status
            if (status === 'Ok')
                setReady(true)
        }
        initCanvas()
    }, [])

    return (
        <Scaffold>
            <SplitPane split="vertical" minSize='50%' defaultSize='60%' 
                className="createWindow" maxSize="100%">
                <SplitPane split="horizontal" defaultSize="50%">
                    <chakra.div height="100%" width="100%">
                        <Canvas></Canvas>
                    </chakra.div>
                    <ParamsPanel
                        onRequestStart={() => {
                            WorkingProject.shaderSrc = codeFiles[currentFile].file
                            WorkingProject.compileShaders()
                            WorkingProject.run()
                        }}
                        onRequestPause={WorkingProject.pause}
                        onRequestStop={WorkingProject.stop}
                        onParamChange={WorkingProject.updateUniforms}
                        disabled={!ready}
                    />
                </SplitPane>
                    <CodeEditor 
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
                    />
            </SplitPane>
        </Scaffold>
    )
}
export default Create;




import React, { useEffect } from 'react'
import { 
    chakra, 
    useColorMode,
    Input,
    useColorModeValue
} from '@chakra-ui/react'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Editor from 'react-simple-code-editor'
import SplitPane from 'react-split-pane'
import Sidebar from './sidebar';

import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

import shader from '../../../shaders/compute.wgsl'


const defaultShader = shader//'fn main() {\n\n}\n'

interface CodeFile {
    filename: string,
    file: string,
}
export type CodeFiles = CodeFile[]

const tabListClass = (colorMode: string) => { return {
    "tabList": true,
    "tabListDark": colorMode === 'dark',
    "tabListLight": colorMode === 'light'
}}

const tabClass = (colorMode: string) => { return {
    "tab": true,
    "tabDark": colorMode === 'dark',
    "tabLight": colorMode === 'light'
}}

const hightlightWithLineNumbers = (input, language) =>
  highlight(input, language)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

const CodeEditor = () => {

    const [codeFiles, setCodeFiles] = React.useState<CodeFiles>([])
    const [editedTab, setEditedTab] = React.useState(-1)
    const [currentFile, setCurrentFile] = React.useState(-1)

    const {colorMode, toggleColorMode} = useColorMode()
    

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
        onEditorCodeChange(codeFiles.length, defaultShader, `shader${idx}.wgsl`)
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

    return (
        <chakra.div maxHeight="100%" display="flex">
            <SplitPane primary="second" maxSize={32} allowResize={false} resizerStyle={{cursor: 'default', backgroundColor:(useColorModeValue("white", 'gray.800'))}}>
                <Tabs id="tabContainer" selectedTabClassName={
                                colorMode==="light" ? "tabLight--selected" : "tabDark--selected"
                            }
                        onSelect={(idx) => setCurrentFile(idx)}>
                    <TabList className={tabListClass(colorMode)} onScroll={()=>console.log('scrolled')}>
                        {
                        codeFiles.map((codefile, idx) => 
                            <Tab className={tabClass(colorMode)} key={idx}>
                                <Input 
                                    onDoubleClickCapture={() => onTabDoubleClick(idx)}
                                    onBlurCapture={() => onFinishedEditingTab()}
                                    onChange={(ev) => onTabNameChanged(ev, idx)}
                                    userSelect="none"
                                    readOnly={editedTab !== idx}
                                    maxLength={20}
                                    variant="unstyled"
                                    size="sm" 
                                    width="auto"
                                    value={codefile.filename}
                                    boxSizing="border-box"
                                    spellCheck={false}
                                    style={{
                                        padding: "5px",
                                        borderColor: "red",
                                        borderBottom: editedTab == idx ? "0.5px solid": "none",
                                        cursor: editedTab == idx ? 'text': 'pointer',
                                        textAlign: "center",
                                        width: `${(codefile.filename.length/2)+2}em`
                                    }}
                                />
                            </Tab>
                        )}
                    </TabList>
                    {
                    codeFiles.map((codefile, idx) => 
                        (<chakra.div overflowY="auto" maxHeight="100%">
                            <TabPanel>
                                <Editor
                                    className="editor"
                                    textareaId="codeArea"
                                    value={codefile.file}
                                    onValueChange={(code) => onEditorCodeChange(idx, code, codefile.filename)}
                                    highlight={code => hightlightWithLineNumbers(code, languages.rust)}
                                    padding={10}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 13,
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </TabPanel>
                        </chakra.div>))
                    }
                </Tabs>
                <Sidebar 
                    onCreateNewFile={createNewFile}
                    onDeleteFile={deleteFile}
                    codeFiles={codeFiles}
                    currentFile={currentFile}
                />
            </SplitPane>
            
        </chakra.div>
    )
}

export default CodeEditor;
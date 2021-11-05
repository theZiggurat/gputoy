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

import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

import { CodeFiles } from '../../../pages/create';
import Sidebar from './sidebar';

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


interface CodeEditorProps {
    codeFiles: CodeFiles,
    editedTab: number,
    currentFile: number,
    onEditorCodeChange: (idx: number, code: string, filename: string) => void,
    createNewFile: () => void,
    deleteFile: (idx: number) => void,
    onTabDoubleClick: (idx: number) => void
    onFinishEditingTab: () => void,
    onTabNameChanged: (ev: React.ChangeEvent<HTMLInputElement>, idx: number) => void,
    setCurrentFile: React.Dispatch<React.SetStateAction<number>>,
}

const CodeEditor = (props: CodeEditorProps) => {

    const {colorMode, toggleColorMode} = useColorMode()

    useEffect(() => props.createNewFile(), [])

    return (
        <chakra.div maxHeight="100%" display="flex">
            <SplitPane primary="second" maxSize={32} allowResize={false} resizerStyle={{cursor: 'default', backgroundColor:(useColorModeValue("white", '#191d28'))}}>
                <Tabs id="tabContainer" selectedTabClassName={
                                colorMode==="light" ? "tabLight--selected" : "tabDark--selected"
                            }
                        onSelect={(idx: number) => props.setCurrentFile(idx)}>
                    <TabList className={tabListClass(colorMode)} onScroll={()=>console.log('scrolled')}>
                        {
                        props.codeFiles.map((codefile, idx) => 
                            <Tab className={tabClass(colorMode)} key={idx}>
                                <Input 
                                    onDoubleClickCapture={() => props.onTabDoubleClick(idx)}
                                    onBlurCapture={() => props.onFinishEditingTab()}
                                    onChange={(ev) => props.onTabNameChanged(ev, idx)}
                                    userSelect="none"
                                    readOnly={props.editedTab !== idx}
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
                                        borderBottom: props.editedTab == idx ? "0.5px solid": "none",
                                        cursor: props.editedTab == idx ? 'text': 'pointer',
                                        textAlign: "center",
                                        width: `${(codefile.filename.length/2)+2}em`
                                    }}
                                />
                            </Tab>
                        )}
                    </TabList>
                    {
                    props.codeFiles.map((codefile, idx) => 
                        (<chakra.div overflowY="auto" maxHeight="100%" key={idx}>
                            <TabPanel>
                                <Editor
                                    className="editor"
                                    textareaId="codeArea"
                                    value={codefile.file}
                                    onValueChange={code => props.onEditorCodeChange(idx, code, codefile.filename)}
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
                    onCreateNewFile={props.createNewFile}
                    onDeleteFile={props.deleteFile}
                    codeFiles={props.codeFiles}
                    currentFile={props.currentFile}
                />
            </SplitPane>
            
        </chakra.div>
    )
}

export default CodeEditor;
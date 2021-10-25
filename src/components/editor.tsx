import React, { useEffect, ReactElement } from 'react'
import { 
    chakra, 
    useColorMode,
    Divider,
    IconButton,
    Input,
    Flex,
    useColorModeValue
} from '@chakra-ui/react'
import Editor from 'react-simple-code-editor'
import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import {IoIosAdd} from 'react-icons/io'
import {
    BsFileCheck,
    BsFileEarmarkPlus,
    BsFileEarmarkX,
    BsFileEarmarkArrowUp,
    BsFileEarmarkArrowDown,

} from 'react-icons/bs'

import SplitPane from 'react-split-pane'

const defaultShader = 'fn main() {\n\n}\n'

interface CodeFile {
    filename: string,
    file: string,
}
type CodeFiles = CodeFile[]

interface SidebarButtonProps {
    onClick: () => void,
    icon: ReactElement,
    purpose: string,
}

const SidebarButton = (props: SidebarButtonProps) => (
    <IconButton 
        m={1}
        borderRadius='100%'
        display="flex"
        justifyContent="center"
        alignItems="center"
        size="md"
        icon={
            React.cloneElement(props.icon, {size: 20})
        } 
        variant="ghost"  
        aria-label={props.purpose} 
        title={props.purpose}
        onClick={props.onClick}
        _hover={{
            bg: useColorModeValue('gray.300', 'gray.700'),
            shadow: "lg"
        }}
        _focus={{
            bg: useColorModeValue('gray.400', 'gray.600'),
            shadow: "lg"
        }}
    />
)

const tabListClass = (colorMode) => { return {
    "tabList": true,
    "tabListDark": colorMode === 'dark',
    "tabListLight": colorMode === 'light'
}}

const tabClass = (colorMode) => { return {
    "tab": true,
    "tabDark": colorMode === 'dark',
    "tabLight": colorMode === 'light'
}}

const tabSelectedClass = (colorMode) => { return {
    "tab--selected": true,
    "tabDark--selected": colorMode === 'dark',
    "tabLight--selected": colorMode === 'light'
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
            <SplitPane primary="second" maxSize={32} allowResize={false} resizerStyle={{cursor: 'default', backgroundColor:"white"}}>
                <Tabs id="tabContainer" selectedTabClassName={
                                colorMode==="light" ? "tabLight--selected" : "tabDark--selected"
                            }
                        onSelect={(idx) => setCurrentFile(idx)}>
                    <TabList className={tabListClass(colorMode)}>
                        {codeFiles.map((codefile, idx) => (
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
                        ))}
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
                <chakra.div height="100%" backgroundColor={useColorModeValue('gray.150', 'gray.850')}>
                    <Flex direction="column">
                        <SidebarButton icon={<BsFileEarmarkPlus/>} purpose="New file" onClick={createNewFile}/>
                        <SidebarButton icon={<BsFileEarmarkX/>} purpose="Delete file" onClick={() => deleteFile(currentFile)}/>
                        <SidebarButton icon={<BsFileEarmarkArrowUp/>} purpose="Upload file" onClick={createNewFile}/>
                        <SidebarButton icon={<BsFileEarmarkArrowDown/>} purpose="Download file" onClick={createNewFile}/>
                        <Divider mt={1} mb={1} color={useColorModeValue('gray.100', 'gray.850')}/>
                        <SidebarButton icon={<BsFileCheck/>} purpose="New file" onClick={createNewFile}/>
                    </Flex>   
                </chakra.div>
            </SplitPane>
            
        </chakra.div>
    )
}

export default CodeEditor;
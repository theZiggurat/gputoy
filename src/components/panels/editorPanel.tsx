import React, { useEffect } from 'react'
import { 
    useColorMode,
    Input,
    IconButton,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    Button,
    Popover,
    PopoverArrow,
    PopoverTrigger,
    PopoverContent,
    Portal,
    Flex,
    Box,
} from '@chakra-ui/react'

import { CloseIcon } from '@chakra-ui/icons';

import Editor from 'react-simple-code-editor'

import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

import Panel, {PanelBar, PanelContent, PanelBarMiddle, PanelBarEnd, PanelProps} from './panel'
import {RiArrowDropUpLine, RiArrowDropDownLine} from 'react-icons/ri'
import {FaQuestion} from 'react-icons/fa'
import {FaRegClipboard, FaRegTrashAlt, FaSearch} from 'react-icons/fa'
import {HiDocumentAdd} from 'react-icons/hi'
import { MdAdd, MdClose } from 'react-icons/md';

const hightlightWithLineNumbers = (input, language) =>
  highlight(input, language)
    .split("\n")
    .map((line: string, i: number) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");


type Lang = 'wgsl' | 'glsl'
export interface CodeFile {
    filename: string,
    file: string,
    lang: Lang,
}

interface EditorProps {
    onEditCode: (idx: number, code: string) => void,
    onEditFileName: (idx: number, code: string) => void,
    onCreateFile: (lang: Lang) => number,
    onDeleteFile: (idx: number) => void,
    files: CodeFile[],
}

interface EditorDynProps {
    workspace: number[]
    currentFile: number,
}

const EditorPanel = (props: EditorProps & EditorDynProps & PanelProps) => {
 
    const [workspace, setWorkspace] = React.useState<number[]>([])
    const [currentFileIndex, setCurrentFileIndex] = React.useState(-1)
    const {colorMode, toggleColorMode} = useColorMode()
    const [popoverWidth, setPopoverWidth] = React.useState(200)

    const [isFileDrawerOpen, setFileDrawerOpen] = React.useState(false)
    const toggleDrawer = () => setFileDrawerOpen(isopen => !isopen)
    const closeDrawer = () => setFileDrawerOpen(false)

    const currentFile = props.files[currentFileIndex]

    const onHandleFilenameChange = (ev) => props.onEditFileName(currentFileIndex, ev.target.value)
    const onHandleAddFile = () => {
        let newIdx = props.onCreateFile('wgsl')
        setCurrentFileIndex(newIdx)
    }

    const onHandleSelectFile = (idx: number) => {
        setCurrentFileIndex(idx)
        if (idx !in workspace)
            setWorkspace(prev => [...prev, idx])
        close()
    }

    return (
        <Panel {...props}>
            <PanelContent>
                <Box width="100%" height="100%">
                {
                    currentFileIndex < props.files.length && currentFileIndex >= 0 &&
                    <Editor
                        className="editor"
                        textareaId="codeArea"
                        value={props.files[currentFileIndex].file}
                        onValueChange={code => props.onEditCode(currentFileIndex, code)}
                        highlight={code => hightlightWithLineNumbers(code, languages.rust)}
                        padding={20}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 13,
                        }}
                    />
                }
                </Box>
            </PanelContent>
            <PanelBar preventScroll={isFileDrawerOpen}>
                <PanelBarMiddle zIndex="20">
                    <IconButton
                        aria-label="Browse files"
                        title="Browse files"
                        size="sm"
                        borderEndRadius="0"
                        icon={isFileDrawerOpen ? <RiArrowDropDownLine size={17}/> : <RiArrowDropUpLine size={17}/>}
                        onClick={toggleDrawer}
                    />
                    <Popover
                        placement='top-start'
                        gutter={0}
                        preventOverflow
                        boundary={props.boundary}
                        isOpen={isFileDrawerOpen}
                        onClose={closeDrawer}
                        modifiers={[
                            {
                                name: 'preventOverflow',
                                options: {
                                    tether: false,
                                }
                            }
                        ]}
                    >
                        <PopoverTrigger>
                            <Input
                                size="sm" 
                                variant="filled" 
                                maxWidth="500" 
                                minWidth="200" 
                                width="200"
                                borderRadius="0"
                                onChange={onHandleFilenameChange}
                                value={currentFile ? currentFile.filename : ''}
                                fontWeight="light"
                            />
                        </PopoverTrigger>
                        <Portal>
                            <PopoverContent 
                                zIndex="10"
                                width="fit-content"
                                backgroundColor="gray.900"
                                border={0}
                            >
                                <Flex direction="column" width="200px" backgroundColor="gray.850">
                                {
                                    props.files.map((file, idx) => 
                                        <Button
                                            size="sm"
                                            backgroundColor={idx == currentFileIndex ? "whiteAlpha.300": "whiteAlpha.50"}
                                            borderBottom="1px"
                                            borderBottomRadius="0"
                                            borderTopRadius={idx!=0 ? "inherit" : ""}
                                            borderColor="whiteAlpha.200"
                                            fontWeight="light"
                                            onClick={() => onHandleSelectFile(idx)}
                                            justifyContent="start"
                                            //iconLeft={desc.icon} 
                                        >
                                        {`${file.filename}.${file.lang}`}
                                    </Button>
                                    )
                                }                  
                                </Flex> 
                            </PopoverContent>
                        </Portal>
                    </Popover>
                    <IconButton
                        aria-label="Add file"
                        title="Add file"
                        size="sm"
                        borderRadius="0"
                        onClick={onHandleAddFile}
                        icon={<MdAdd size={17}/>}
                    />
                    <IconButton
                        aria-label="Remove file from workspace"
                        title="Remove file from workspace"
                        size="sm"
                        borderStartRadius="0"
                        icon={<MdClose size={17}/>}
                    />
                </PanelBarMiddle>
                <PanelBarEnd>
                    <IconButton
                        size="sm"
                        icon={<FaQuestion/>}
                        borderStartRadius="25%"
                        borderEndRadius="0%"
                        borderRight="1px"
                        borderColor="blackAlpha.300"
                    />
                    <Button
                        fontWeight='thin'
                        size="sm"
                        leftIcon={<HiDocumentAdd/>}
                        borderRight="1px"
                        borderColor="blackAlpha.300"
                        borderRadius={0}
                    >
                        Add
                    </Button>
                    <Button
                        fontWeight='thin'
                        size="sm"
                        leftIcon={<FaRegTrashAlt/>}
                        mr={2}
                        borderColor="blackAlpha.300"
                        borderStartRadius="0%"
                        borderEndRadius="6px"
                    >
                        Delete
                    </Button>
                </PanelBarEnd>
            </PanelBar>
        </Panel>                
    )
}

export const useEditorPanel = (): EditorProps => {

    const [files, setFiles] = React.useState<CodeFile[]>(() =>{
        return [{filename: 'test', file: 'aaa', lang: 'wgsl'}]
    })

    // file loading
    useEffect(() => {
        let storedFiles = window.localStorage.getItem('files');
        if (storedFiles) {
            let files = JSON.parse(storedFiles)
            if (files.length > 0){
                setFiles(files)
                return
            }
        } 
        setFiles([{filename: 'test', file: 'aaa', lang: 'wgsl'}])
    }, [])

    // file saving
    useEffect(() => {
        window.localStorage.setItem('files', JSON.stringify(files))
     }, [files])


    const onEditCode = (idx: number, code: string) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx] = {
                ...prevCode[idx],
                file: code
            }
            return updated
        })
    }

    const onCreateFile = (lang: Lang): number => {
        let idx = 0
        let len = files.length
        while (files.map((c) => c.filename).includes(`shader${idx}`)) 
            ++idx
        setFiles(prevCode => [...prevCode, {
            filename: `shader${idx}`,
            file: '',
            lang: lang
        }])
        return len
    }

    const onDeleteFile = (idx: number) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated.splice(idx, 1)
            return updated
        })
    }

    const onEditFileName = (idx: number, filename: string) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx].filename = filename
            return updated
        })
    }

    return { files, onEditCode, onCreateFile, onDeleteFile, onEditFileName }
}

export default EditorPanel;
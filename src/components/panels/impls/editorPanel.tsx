import React, { useCallback, useEffect } from 'react'
import { 
    Input,
    IconButton,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Portal,
    Flex,
    Box,
} from '@chakra-ui/react'

import Editor from 'react-simple-code-editor'

import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

import { Panel, PanelBar, PanelContent, PanelBarMiddle, PanelBarEnd, PanelProps, DynamicPanelProps} from '../panel'
import { RiArrowDropUpLine, RiArrowDropDownLine } from 'react-icons/ri'
import { FaRegTrashAlt} from 'react-icons/fa'
import { MdAdd, MdClose, MdCode, MdSettings } from 'react-icons/md'
import useInstance, { EditorInstanceState } from '../../../recoil/instance'
import { RowButton } from '../../reusable/rowButton';
import { codeFiles } from '../../../recoil/project';
import { useRecoilState } from 'recoil';

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

const EditorPanel = (props: EditorProps & DynamicPanelProps) => {

    const [ instanceState, setInstanceState ] = useInstance<EditorInstanceState>(props)
    const { files, onEditCode, onCreateFile, onDeleteFile, onEditFileName } = useEditorPanel()
 
    const [workspace, setWorkspace] = React.useState<number[]>([])

    const setCurrentFileIndex = (index: number) => {
        setInstanceState({...instanceState, currentFileIndex: index})
    }

    const [isFileDrawerOpen, setFileDrawerOpen] = React.useState(false)
    const toggleDrawer = () => setFileDrawerOpen(isopen => !isopen)
    const closeDrawer = () => setFileDrawerOpen(false)

    const currentFile = files[instanceState.currentFileIndex]

    const onHandleFilenameChange = (ev) => onEditFileName(instanceState.currentFileIndex, ev.target.value)
    const onHandleAddFile = () => {
        let newIdx = onCreateFile('wgsl')
        setCurrentFileIndex(newIdx)
    }

    const onHandleSelectFile = (idx: number) => {
        setCurrentFileIndex(idx)
        if (idx !in workspace)
            setWorkspace(prev => [...prev, idx])
        closeDrawer()
    }

    return (
        <Panel {...props}>
            <PanelContent>
                <Box width="100%" height="100%">
                {
                    currentFile &&
                    <Editor
                        className="editor"
                        textareaId="codeArea"
                        value={currentFile.file}
                        onValueChange={code => onEditCode(instanceState.currentFileIndex, code)}
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
                                    files.map((file, idx) => 
                                        <Button
                                            size="sm"
                                            backgroundColor={idx==instanceState.currentFileIndex ? "whiteAlpha.300": "whiteAlpha.50"}
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
                    <RowButton
                        purpose="Check code"
                        size="sm"
                        icon={<MdCode/>}
                        first
                    />
                    <RowButton
                        purpose="Delete file"
                        icon={<FaRegTrashAlt/>}
                    />
                    <RowButton
                        purpose="Settings"
                        icon={<MdSettings/>}
                        last
                    />
                </PanelBarEnd>
            </PanelBar>
        </Panel>                
    )
}

export const useEditorPanel = (): EditorProps => {

    const [filesState, setFiles] = useRecoilState<CodeFile[]>(codeFiles)

    // // file loading
    // useEffect(() => {
    //     let storedFiles = window.localStorage.getItem('files');
    //     if (storedFiles) {
    //         let files = JSON.parse(storedFiles)
    //         if (files.length > 0){
    //             setFiles(files)
    //             return
    //         }
    //     } 
    //     setFiles([{filename: 'test', file: 'aaa', lang: 'wgsl'}])
    // }, [])

    // // file saving
    // useEffect(() => {
    //     window.localStorage.setItem('files', JSON.stringify(files))
    //  }, [files])


    const onEditCode = useCallback((idx: number, code: string) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx] = {
                ...prevCode[idx],
                file: code
            }
            return updated
        })
    }, [filesState])

    const onCreateFile = useCallback((lang: Lang): number => {
        let idx = 0
        let len = filesState.length
        while (files.map((c) => c.filename).includes(`shader${idx}`)) 
            ++idx
        setFiles(prevCode => [...prevCode, {
            filename: `shader${idx}`,
            file: '',
            lang: lang
        }])
        return len
    }, [filesState])

    const onDeleteFile = useCallback((idx: number) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated.splice(idx, 1)
            return updated
        })
    }, [filesState])

    const onEditFileName = useCallback((idx: number, filename: string) => {
        setFiles(prevCode => {
            let updated = [...prevCode]
            updated[idx].filename = filename
            return updated
        })
    }, [filesState])

    return { files: filesState, onEditCode, onCreateFile, onDeleteFile, onEditFileName }
}

export default EditorPanel;
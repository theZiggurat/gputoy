import React, { useEffect } from 'react'
import { 
    useColorMode,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightAddon,
    IconButton,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    Button,
} from '@chakra-ui/react'

import { CloseIcon } from '@chakra-ui/icons';

import Editor from 'react-simple-code-editor'

import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

import { CodeFiles } from '../../../pages/create';
import Panel, {PanelBar, PanelContent, PanelBarMiddle, PanelBarEnd} from './panel'
import {RiArrowDropUpLine, RiArrowDropDownLine} from 'react-icons/ri'
import {FaQuestion} from 'react-icons/fa'
import {FaRegClipboard, FaRegTrashAlt, FaSearch} from 'react-icons/fa'
import {HiDocumentAdd} from 'react-icons/hi'

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

const EditorPanel = (props: CodeEditorProps) => {

    const {colorMode, toggleColorMode} = useColorMode()

    useEffect(() => props.createNewFile(), [])

    return (
        <Panel {...props}>
            <PanelContent>
                <Tabs colorScheme='white' variant='enclosed-colored'>
                    <TabList borderColor="whiteAlpha.100" backgroundColor='gray.900'>
                        {props.codeFiles.map((codefile, idx) => 
                            <Tab fontSize='smaller' 
                                key={idx} 
                                ml={2} 
                                backgroundColor='transparent' 
                                borderColor='transparent'
                            >
                                {codefile.filename}
                            </Tab>
                        )}
                    </TabList>

                    <TabPanels>
                    {props.codeFiles.map((codefile, idx) => 
                        <TabPanel>
                        <Editor
                            className="editor"
                            textareaId="codeArea"
                            value={props.codeFiles.length > 0 ? props.codeFiles[0].file: ''}
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
                    )}
                    </TabPanels>
                </Tabs>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                <InputGroup ml={2} size="sm" variant="filled" maxWidth="500" minWidth="100" >
                    <InputLeftElement
                        children={<RiArrowDropUpLine size={20}/>}
                    />
                    <Input
                        borderRadius="md"
                        value={props.codeFiles.length > 0 ? props.codeFiles[0].filename: ''}
                    />
                    <InputRightAddon
                        borderRadius="md"
                        size="sm"
                        children={<CloseIcon size="sm"/>}
                    />
                </InputGroup>
                </PanelBarMiddle>
                <PanelBarEnd>
                    <IconButton
                        size="sm"
                        icon={<FaQuestion/>}
                        borderStartRadius="100%"
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
                        borderEndRadius="500px"
                    >
                        Delete
                    </Button>
                </PanelBarEnd>
            </PanelBar>
        </Panel>
        
                            
    )
}

export default EditorPanel;
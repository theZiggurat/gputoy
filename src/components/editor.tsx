import React, { useEffect } from 'react'
import { 
    chakra, 
    useColorMode,
    Textarea,
    Flex, 
    IconButton, 
    Divider, 
    Input, 
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper, 
} from '@chakra-ui/react'

import Editor from 'react-simple-code-editor'
import "prismjs";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";
import shader from '../../shaders/diffuse.wgsl'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';



const hightlightWithLineNumbers = (input, language) =>
  highlight(input, language)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

type CodeFiles = Record<string,string>

const CodeEditor = () => {
    const [code, setCode] = React.useState<CodeFiles>({});
    const {colorMode, toggleColorMode} = useColorMode()

    var tabListClass = {
        "tabList": true,
        "tabListDark": colorMode === 'dark',
        "tabListLight": colorMode === 'light'
    }

    var tabClass = {
        "tab": true,
        "tabDark": colorMode === 'dark',
        "tabLight": colorMode === 'light'
    }

    var tabSelectedClass = {
        "tab--selected": true,
        "tabDark--selected": colorMode === 'dark',
        "tabLight--selected": colorMode === 'light'
    }

    useEffect(() => {
        let files = window.localStorage.getItem("files");
        if (files != null) {
            let codefiles: CodeFiles = {};
            files.split(',').forEach(filename => {
                let file = window.localStorage.getItem(filename);
                if (file != null) {
                    codefiles[filename] = file
                }
            })
            setCode(codefiles)
        }
    }, [])

    const _setCode = (code: string, filename: string) => {
        window.localStorage.setItem(filename, code)
        setCode(prevCode => {
            let updated = {...prevCode}
            updated[filename] = code
            console.log("new code: ", updated)
            return updated
        })
    }

    return (
        <chakra.div overflowY="auto" maxHeight="100%">
            <Tabs className="react-tabs_MOD" selectedTabClassName={
                            colorMode==="light" ? "tabLight--selected" : "tabDark--selected"
                        }>
                <TabList className={tabListClass}>
                    {Object.keys(code).map((filename) => 
                        <Tab className={tabClass} >
                            {filename}
                    </Tab>)}
                </TabList>
                {
                Object.entries(code).map(([filename, file]) => 
                    (<TabPanel>
                        <Editor
                            className="editor"
                            textareaId="codeArea"
                            value={file}
                            onValueChange={(code) => _setCode(code, filename)}
                            highlight={code => hightlightWithLineNumbers(code, languages.rust)}
                            padding={10}
                            style={{
                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                fontSize: 13,
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </TabPanel>))
                }
            </Tabs>
        </chakra.div>
    )
}

export default CodeEditor;
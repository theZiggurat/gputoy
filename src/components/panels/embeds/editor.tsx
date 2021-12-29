import {
    Box, Flex, useColorModeValue
} from '@chakra-ui/react';
import * as types from '@gpu/types';
import { currentProjectIDAtom, projectShaderErrorsAtom, projectShadersAtom } from '@recoil/project';
import "prismjs";
// @ts-ignore
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";
import React, { useCallback, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { useRecoilState, useRecoilValue } from 'recoil';
import { darkEditor, lightEditor } from '../../../theme/consts';





export const hightlightWithLineNumbers = (input, language, filename, fileErrors) =>
    highlight(input, language)
        .split("\n")
        .map((line: string, i: number) => i == fileErrors[filename] - 1 ? `<span class="editorLineNumberTest">${line}</span>` : line)
        .map((line: string, i: number) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
        .join("\n");

interface EditorProps {
    onEditCode: (idx: number, code: string) => void,
    onEditFileName: (idx: number, code: string) => void,
    onCreateFile: (lang: types.Lang) => number,
    onDeleteFile: (idx: number) => void,
    files: types.CodeFile[],
}

const EditorEmbedable = (props: { ref, width: number }) => {

    const [instanceState, setInstanceState] = useState({
        currentFileIndex: 0,
    })
    const { files, onEditCode, onCreateFile, onDeleteFile, onEditFileName } = useEditorPanel()
    const fileErrorValue = useRecoilValue(projectShaderErrorsAtom)

    const [workspace, setWorkspace] = React.useState<number[]>([])

    const [isFileDrawerOpen, setFileDrawerOpen] = React.useState(false)

    const currentFile = files[instanceState.currentFileIndex]

    return (
        <Flex
            flexDir="column"
            h="100%"
            maxH="100%"
            minW="fit-content"
            overflowY="scroll"
            overflowX="hidden"
        >
            <Box minWidth="100%" sx={useColorModeValue(lightEditor, darkEditor)}>
                {
                    currentFile &&
                    <Editor
                        className="editor"
                        textareaId="codeArea"
                        value={currentFile.file}
                        onValueChange={code => onEditCode(instanceState.currentFileIndex, code)}
                        highlight={code => hightlightWithLineNumbers(code, languages.rust, currentFile.filename, fileErrorValue)}
                        padding={20}
                        style={{
                            fontFamily: '"JetBrains Mono","Fira code", "Fira Mono", monospace',
                            fontSize: 11,
                        }}
                    />
                }
            </Box>
        </Flex>
    )
}

export const useEditorPanel = (): EditorProps => {

    const projectID = useRecoilValue(currentProjectIDAtom)
    const [filesState, setFiles] = useRecoilState(projectShadersAtom(projectID))

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

    const onCreateFile = useCallback((lang: types.Lang): number => {
        let idx = 0
        let len = filesState.length
        while (filesState.map((c) => c.filename).includes(`shader${idx}`))
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
            updated[idx] = Object.assign({}, prevCode[idx], { filename })
            return updated
        })
    }, [filesState])

    return { files: filesState, onEditCode, onCreateFile, onDeleteFile, onEditFileName }
}

export default EditorEmbedable
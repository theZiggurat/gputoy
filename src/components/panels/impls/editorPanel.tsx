import {
	Box, Flex, useColorModeValue
} from '@chakra-ui/react';
import useInstance from '@core/hooks/useInstance';

import React, { LegacyRef, useEffect } from 'react';
//import Editor from 'react-simple-code-editor';
import { darkEditor, lightEditor } from '../../../theme/consts';
import { fontMono, themed } from '../../../theme/theme';
import { EditorInstanceState } from '../descriptors';
import { Panel, PanelBar, PanelContent, PanelInProps } from '../panel';
import Editor, { Monaco, useMonaco } from '@monaco-editor/react'

import { languageExtensionPoint, languageID } from '../../../monaco/config'
import { monarchLanguage, conf } from '../../../monaco/wgsl'
import darktheme from 'monaco/darktheme';
import lighttheme from 'monaco/lighttheme';
import completions from 'monaco/completions';
import FileTab from '@components/create/editor/filetab';
import useHorizontalScroll from 'utils/scrollHook';
import { useTaskReciever } from '@core/hooks/useTask';
import { useFile } from '@core/hooks/useFiles';
import { isData, isText } from '@core/types';
import EditorPanelBar from '@components/create/editor/editorPanelBar';

const EditorContent = (props: { fileId: string }) => {

	const { file, setData } = useFile(props.fileId)
	const { filename, path, extension, data, metadata, fetch } = file

	const monacoTheme = useColorModeValue('light', 'dark')
	const monaco = useMonaco()

	const onMonacoBeforeMount = (monaco: Monaco) => {
		monaco.languages.register(languageExtensionPoint)
		monaco.languages.onLanguage(languageID, () => {
			monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage)
			monaco.languages.setLanguageConfiguration(languageID, conf)
			monaco.languages.registerCompletionItemProvider(languageID, completions)
		})
		monaco.editor.defineTheme('dark', darktheme)
		monaco.editor.defineTheme('light', lighttheme)
	}

	useEffect(() => {
		console.log('setting theme', monacoTheme)
		monaco?.editor.setTheme(monacoTheme)
		setTimeout(() => monaco?.editor.setTheme(monacoTheme), 1)
	}, [monacoTheme, monaco])

	return <Box width="100%" sx={useColorModeValue(lightEditor, darkEditor)} flex="1 1 auto" overflowX="hidden">
		{
			isText(extension) &&
			<Editor
				height="100%"
				path={props.fileId}
				defaultLanguage={extension}
				defaultValue={data}
				saveViewState
				beforeMount={onMonacoBeforeMount}
				onChange={value => setData(value ?? "undefined")}
				options={{
					fontSize: 13,
					minimap: {
						enabled: false
					},
					padding: {
						top: 20,
						bottom: 20
					},
					fontFamily: fontMono,
					overviewRulerLanes: 0,
					scrollBeyondLastLine: false,
					scrollbar: {
						verticalScrollbarSize: 10,
					},
					suggest: {
						//preview: true,
						snippetsPreventQuickSuggestions: false,
					},
					theme: monacoTheme
				}}
			/>
		}
		{
			isData(extension) &&
			<></>
		}
	</Box>
}

const EditorPanel = (props: PanelInProps) => {

	const [instanceState, setInstanceState] = useInstance<EditorInstanceState>(props)
	const { workspace, currentFileIndex } = instanceState
	const currentFileId = (currentFileIndex !== undefined) ? workspace[currentFileIndex] : undefined

	const setCurrentFileIndex = (index: number) => {
		setInstanceState({ ...instanceState, currentFileIndex: index })
	}

	const addFileToWorkspace = (localId: string, move?: boolean) => {
		const index = workspace.indexOf(localId)
		const len = workspace.length
		if (index < 0) {
			setInstanceState(old => {
				//console.log('setting', { ...old, workspace: [...old.workspace, localId] })
				return { currentFileIndex: move ? len : old.currentFileIndex, workspace: old.workspace.concat(localId) }
			})
		} else if (index != currentFileIndex && move) {
			setCurrentFileIndex(index)
		}
	}

	const onHandleTabClose = (idx: number) => {
		setInstanceState(prev => {
			let newWorkspace = [...prev.workspace]
			newWorkspace.splice(idx, 1)
			let newidx = Math.min(prev.currentFileIndex ?? 0, newWorkspace.length - 1)
			return {
				currentFileIndex: newidx < 0 ? undefined : newidx,
				workspace: newWorkspace
			}
		})
	}

	useTaskReciever(props.instanceID, {
		"addToWorkspace": task => {
			if (typeof task.args === 'string') {
				addFileToWorkspace(task.args, true)
			}
			return true
		}
	})


	const scrollRef = useHorizontalScroll()

	return (
		<Panel {...props}>
			<PanelContent display="flex" flexDir="column" overflowY="hidden" overFlowX="hidden">
				{
					workspace.length > 1 &&
					<Flex
						flex="0 0 auto"
						height="2.3rem"
						w="100%"
						bg={themed('a2')}
						alignItems="end"
						ref={scrollRef as LegacyRef<HTMLDivElement>}
						overflowX="hidden"
					>
						<Box flex="0 0 auto" borderBottom="1px" borderColor={themed('borderLight')} w="2rem" />
						{
							workspace.map((fileId, idx) => (
								<FileTab
									key={fileId}
									fileId={fileId}
									idx={idx}
									selectedFileIdx={currentFileIndex ?? -1}
									onSelect={setCurrentFileIndex}
									onClose={onHandleTabClose}
									first={idx == 0}
								/>
							))
						}
						<Box flex="1 1 auto" borderBottom="1px" borderColor={themed('borderLight')} minW="2rem" />
					</Flex>

				}
				{
					currentFileId &&
					<EditorContent fileId={currentFileId} />
				}
			</PanelContent>
			<PanelBar>
				<EditorPanelBar fileId={currentFileId} />
			</PanelBar>

		</Panel>
	)
}
export default EditorPanel
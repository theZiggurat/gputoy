import {
	Box, Flex, useColorModeValue
} from '@chakra-ui/react';
import useInstance from '@core/hooks/useInstance';

import React, { LegacyRef, useEffect } from 'react';
//import Editor from 'react-simple-code-editor';
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
import setJSONSchema from 'monaco/jsonSchema';



const EditorContent = (props: {
	fileId: string
	onClose: (fileId: string) => void
}) => {

	const { file, setData, setMetadata } = useFile(props.fileId)
	const { extension, data } = file

	const monacoTheme = useColorModeValue('light', 'dark')
	const monaco = useMonaco()

	const colorMode = useColorModeValue('light', 'dark')

	const onMonacoBeforeMount = (monaco: Monaco) => {
		monaco.languages.register(languageExtensionPoint)
		monaco.languages.onLanguage(languageID, () => {
			monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage)
			monaco.languages.setLanguageConfiguration(languageID, conf)
			monaco.languages.registerCompletionItemProvider(languageID, completions)
		})
		monaco.editor.defineTheme('dark', darktheme)
		monaco.editor.defineTheme('light', lighttheme)
		setJSONSchema(monaco)
	}

	const onMonacoValidate = (markers: any[]) => {
		if (markers.length > 0) {
			setMetadata("valid", false)
		} else {
			setMetadata("valid", true)
		}
	}

	useEffect(() => {
		monaco?.editor.setTheme(monacoTheme)
		setTimeout(() => monaco?.editor.setTheme(monacoTheme), 1)
	}, [monacoTheme, monaco])

	return <Box width="100%" flex="1 1 auto" overflowX="hidden" overflowY="hidden">
		{
			isText(extension) &&
			<Editor
				height="100%"
				path={props.fileId}
				defaultLanguage={extension}
				defaultValue={data}
				saveViewState
				beforeMount={onMonacoBeforeMount}
				onValidate={extension === 'json' ? onMonacoValidate : undefined}
				onChange={value => setData(value ?? "undefined")}
				theme={colorMode}
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
						preview: true,
						snippetsPreventQuickSuggestions: false,
					},
					theme: monacoTheme,
					"semanticHighlighting.enabled": true,
					find: {
						cursorMoveOnType: true
					},
					mouseWheelZoom: true,
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
		setInstanceState(prev => ({ ...prev, currentFileIndex: index }))
	}

	const addFileToWorkspace = (localId: string, move?: boolean) => {
		const index = workspace.indexOf(localId)
		const len = workspace.length
		if (index < 0) {
			setInstanceState(old => {
				return { currentFileIndex: move ? len : old.currentFileIndex, workspace: old.workspace.concat(localId) }
			})
		} else if (index != currentFileIndex && move) {
			setCurrentFileIndex(index)
		}
	}

	const removeFileFromWorkspace = (fileId: string) => {
		const newWorkspace = workspace.filter(f => f !== fileId)
		setInstanceState({
			workspace: newWorkspace,
			currentFileIndex: Math.min(workspace.length - 1, currentFileIndex ?? 0)
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
			<PanelContent display="flex" flexDir="column" overflowY="hidden" overflowX="hidden">
				{
					workspace.length > 0 &&
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
									onClose={removeFileFromWorkspace}
									first={idx == 0}
								/>
							))
						}
						<Box flex="1 1 auto" borderBottom="1px" borderColor={themed('borderLight')} minW="2rem" />
					</Flex>

				}
				{
					currentFileId &&
					<EditorContent fileId={currentFileId} onClose={removeFileFromWorkspace} />
				}
			</PanelContent>
			<PanelBar>
				<EditorPanelBar fileId={currentFileId} />
			</PanelBar>

		</Panel>
	)
}
export default EditorPanel
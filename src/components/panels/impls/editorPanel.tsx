import {
	Box, Button, Checkbox, Flex, HStack, Input, Popover, PopoverContent, PopoverTrigger, Portal, useColorModeValue
} from '@chakra-ui/react';
import * as types from 'core/types';
import useInstance from '@core/hooks/useInstance';
import useLogger from 'core/hooks/useLogger';
import { currentProjectIdAtom, projectShaderErrorsAtom, projectShadersAtom } from 'core/recoil/atoms/project';

import React, { useCallback, useEffect } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { MdAdd, MdClose, MdCode, MdSettings } from 'react-icons/md';
import { RiArrowDropDownLine, RiArrowDropUpLine } from 'react-icons/ri';
//import Editor from 'react-simple-code-editor';
import { useRecoilState, useRecoilValue } from 'recoil';
import { darkEditor, lightEditor } from '../../../theme/consts';
import { themed } from '../../../theme/theme';
import { RowButton } from '@components/shared/rowButton';
import { EditorInstanceState } from '../descriptors';
import { DynamicPanelProps, Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';
import Editor, { Monaco, useMonaco } from '@monaco-editor/react'

import { languageExtensionPoint, languageID } from '../../../monaco/config'
import { monarchLanguage, conf } from '../../../monaco/wgsl'
import darktheme from 'monaco/darktheme';
import lighttheme from 'monaco/lighttheme';
import completions from 'monaco/completions';
interface EditorProps {
	onEditCode: (idx: number, code: string) => void,
	onEditFileName: (idx: number, code: string) => void,
	onCreateFile: (lang: types.Lang) => number,
	onDeleteFile: (idx: number) => void,
	setRender: (idx: number) => void,
	shaders: types.Shader[],
}

const EditorPanel = (props: EditorProps & DynamicPanelProps) => {

	const [instanceState, setInstanceState] = useInstance<EditorInstanceState>(props)
	const { shaders: files, onEditCode, onCreateFile, onDeleteFile, onEditFileName, setRender } = useEditor()
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

	const [workspace, setWorkspace] = React.useState<number[]>([])

	const setCurrentFileIndex = (index: number) => {
		setInstanceState({ ...instanceState, currentFileIndex: index })
	}

	const [isFileDrawerOpen, setFileDrawerOpen] = React.useState(false)
	const toggleDrawer = () => setFileDrawerOpen(isopen => !isopen)
	const closeDrawer = () => setFileDrawerOpen(false)

	const currentFile = files[instanceState.currentFileIndex]

	const onHandleFilenameChange = (ev) => onEditFileName(instanceState.currentFileIndex, ev.target.value)
	const onHandleAddFile = () => {
		let newIdx = onCreateFile('glsl')
		setCurrentFileIndex(newIdx)
	}

	const onHandleSelectFile = (idx: number) => {
		setCurrentFileIndex(idx)
		if (idx! in workspace)
			setWorkspace(prev => [...prev, idx])
		closeDrawer()
	}

	useEffect(() => {
		monaco?.editor.setTheme(monacoTheme)
		setTimeout(() => monaco?.editor.setTheme(monacoTheme), 1)
	}, [monacoTheme, monaco])

	return (
		<Panel {...props}>
			<PanelContent>
				<Box width="100%" height="100%" sx={useColorModeValue(lightEditor, darkEditor)}>
					{
						currentFile &&
						<Editor
							height="100%"
							value={currentFile.file}
							defaultLanguage={languageID}
							beforeMount={onMonacoBeforeMount}
							onChange={value => { if (value !== undefined) onEditCode(instanceState.currentFileIndex, value) }}
							theme="dark"
							options={{
								fontSize: 13,
								minimap: {
									enabled: false
								},
								padding: {
									top: 20,
									bottom: 20
								},
								fontFamily: "'JetBrains Mono'",
								overviewRulerLanes: 0,
								scrollBeyondLastLine: false,
								scrollbar: {
									verticalScrollbarSize: 10,
								},
								suggest: {
									//preview: true,
									localityBonus: true,
									snippetsPreventQuickSuggestions: false,
								},
								theme: monacoTheme
							}}

						/>
					}
				</Box>
			</PanelContent>
			<PanelBar preventScroll={isFileDrawerOpen}>
				<PanelBarMiddle zIndex="3">
					<RowButton
						purpose="Browse files"
						icon={isFileDrawerOpen ? <RiArrowDropDownLine size={17} /> : <RiArrowDropUpLine size={17} />}
						onClick={toggleDrawer}
						first
					/>
					<Popover
						placement='top-start'
						gutter={0}
						preventOverflow
						isOpen={isFileDrawerOpen}
						onClose={closeDrawer}
						closeOnBlur={false}
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
								size="xs"
								maxWidth="500"
								minWidth="200"
								width="200"
								borderRadius="0"
								borderLeft="0"
								onChange={onHandleFilenameChange}
								value={currentFile ? currentFile.filename : ''}
								fontWeight="light"
								autoCorrect="off"
								spellCheck="false"
							/>
						</PopoverTrigger>
						<Portal>
							<PopoverContent
								zIndex="10"
								width="fit-content"
								border="0"
							>
								<Flex
									direction="column"
									width="200px"
									backgroundColor={themed('a2')}
									borderTopRadius="6px"
								>
									{
										files.map((file, idx) =>
											<HStack key={file.file}>
												<Button
													size="sm"
													bg={idx == instanceState.currentFileIndex ?
														themed('inputHovered') :
														themed('input')
													}
													borderBottomRadius="0px"
													borderBottom="0"
													borderTopRadius={idx != 0 ? "0px" : "5px"}
													fontWeight="light"
													onClick={() => onHandleSelectFile(idx)}
													justifyContent="start"
												>
													{`${file.filename}.${file.lang}`}
												</Button>
												<Checkbox
													isChecked={file.isRender ?? false}
													onChange={() => setRender(idx)}
												/>
											</HStack>
										)
									}
								</Flex>
							</PopoverContent>
						</Portal>
					</Popover>
					<RowButton
						purpose="Add file"
						onClick={onHandleAddFile}
						icon={<MdAdd size={17} />}
					/>
					<RowButton
						purpose="Remove file from workspace"
						icon={<MdClose size={17} />}
						last
					/>
				</PanelBarMiddle>
				<PanelBarEnd>
					<RowButton
						purpose="Check code"
						icon={<MdCode />}
						first
					/>
					<RowButton
						purpose="Delete file"
						icon={<FaRegTrashAlt />}
					/>
					<RowButton
						purpose="Settings"
						icon={<MdSettings />}
						last
					/>
				</PanelBarEnd>
			</PanelBar>
		</Panel>
	)
}

export const useEditor = (): EditorProps => {

	const [shaders, setShaders] = useRecoilState(projectShadersAtom)

	const onEditCode = useCallback((idx: number, code: string) => {
		setShaders(prevCode => {
			let updated = [...prevCode]
			updated[idx] = {
				...prevCode[idx],
				file: code
			}
			return updated
		})
	}, [setShaders])

	const onCreateFile = useCallback((lang: types.Lang): number => {
		let idx = 0
		let len = shaders.length
		while (shaders.map((c) => c.filename).includes(`shader${idx}`))
			++idx
		setShaders(prevCode => [...prevCode, {
			filename: `shader${idx}`,
			file: 'hehe test',
			lang: lang,
			isRender: false,
			id: ''
		}])
		return len
	}, [shaders, setShaders])

	const onDeleteFile = useCallback((idx: number) => {
		setShaders(prevCode => {
			let updated = [...prevCode]
			updated.splice(idx, 1)
			return updated
		})
	}, [setShaders])

	const onEditFileName = useCallback((idx: number, filename: string) => {
		setShaders(prevCode => {
			let updated = [...prevCode]
			updated[idx] = Object.assign({}, prevCode[idx], { filename })
			return updated
		})
	}, [setShaders])

	const setRender = (idx: number) => {
		setShaders(curr => {
			return curr.map((f, i) => {
				const newf = { ...f }
				if (i == idx) newf.isRender = true
				else newf.isRender = false
				return newf
			})
		})
	}


	return { shaders, onEditCode, onCreateFile, onDeleteFile, onEditFileName, setRender }
}

export default EditorPanel;
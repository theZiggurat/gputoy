import { CloseIcon } from '@chakra-ui/icons';
import {
	Button, Grid,
	GridItem, IconButton,
	Input, InputGroup,
	InputLeftElement,
	InputRightElement, NumberDecrementStepper, NumberIncrementStepper, NumberInput,
	NumberInputField,
	NumberInputStepper, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Select
} from '@chakra-ui/react';
import ParamListCompact from '@components/create/params/paramListCompact';
import * as types from 'core/types';
import useInstance from '@core/hooks/useInstance';
import { currentProjectIdAtom, projectParamKeys } from 'core/recoil/atoms/project';
import { debounce } from 'lodash';
import { nanoid } from 'nanoid';
import React, { useCallback, useState } from 'react';
import { HexColorPicker } from "react-colorful";
import { FaMinus, FaSearch } from 'react-icons/fa';
import { MdAdd, MdSettings } from 'react-icons/md';
import { useRecoilState, useRecoilValue } from 'recoil';
import { themed } from '../../../theme/theme';
import { RowButton } from '../../shared/rowButton';
import { ParamInstanceState } from '../descriptors';
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';
import { useResizeDetector } from 'react-resize-detector';
import ParamListExpanded from '@components/create/params/paramListExpanded';

interface ParamPanelProps {
	paramKeys: string[],
	addParam: () => void,
	removeParam: (key: string) => void,
}

const ParamPanel = (props: ParamPanelProps) => {

	const { paramKeys, addParam, removeParam } = useParamsPanel()
	const [selectedParam, setSelectedParam] = useState<string | null>(null)
	const { width, height, ref } = useResizeDetector()
	const { ...panelProps } = props
	const [instanceState, setInstanceState] = useInstance<ParamInstanceState>(props)
	const renderCompact = (width ?? 0) < (height ?? 0) * 1.5
	const setKeywordFilter = (filter: string) => setInstanceState({ ...instanceState, keywordFilter: filter })

	//useDebounce(() => setNameErrors(params.map(p => !(/^[a-z0-9]+$/i.test(p.paramName)))), 500, [params])

	return (
		<Panel {...panelProps}>
			<PanelContent ref={ref}>
				{
					renderCompact && <ParamListCompact
						keys={paramKeys}
						selectedParam={selectedParam}
						onChangeSelected={k => setSelectedParam(k)}
					/>
				}
				{
					!renderCompact && <ParamListExpanded
						keys={paramKeys}
						selectedParam={selectedParam}
						onChangeSelected={k => setSelectedParam(k)}
					/>
				}
			</PanelContent>
			<PanelBar>
				<PanelBarMiddle>
					<InputGroup size="xs" maxWidth="500" minWidth="100" >
						<InputLeftElement
						>
							<FaSearch />
						</InputLeftElement>
						<Input
							borderRadius="lg"
							value={instanceState.keywordFilter}
							onChange={ev => setKeywordFilter(ev.target.value)}
						/>
						{
							instanceState.keywordFilter.length > 0 &&
							<InputRightElement
								onClick={() => setKeywordFilter('')}
							>
								<CloseIcon size="sm" />
							</InputRightElement>
						}
					</InputGroup>
				</PanelBarMiddle>
				<PanelBarEnd>
					<RowButton
						purpose="Add param"
						onClick={addParam}
						icon={<MdAdd />}
						first
					/>
					<RowButton
						purpose="Options"
						icon={<MdSettings />}
						last
					/>
				</PanelBarEnd>
			</PanelBar>
		</Panel>
	)
}
export default ParamPanel

export const useParamsPanel = (): ParamPanelProps => {

	const [paramKeys, setParamKeys] = useRecoilState(projectParamKeys)

	const addParam = useCallback(() => {
		setParamKeys(old => [...old, nanoid(8)])
	}, [setParamKeys])

	const removeParam = useCallback((key: string) => {
		setParamKeys(oldKeys => {
			let newParams = [...oldKeys]
			newParams.splice(oldKeys.indexOf(key), 1)
			return newParams
		})
	}, [setParamKeys])

	return { paramKeys, addParam, removeParam }
}

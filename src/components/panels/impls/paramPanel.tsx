import { CloseIcon } from '@chakra-ui/icons';
import {
	Button, Flex,
	Grid,
	GridItem, IconButton,
	Input, InputGroup,
	InputLeftElement,
	InputRightElement, NumberDecrementStepper, NumberIncrementStepper, NumberInput,
	NumberInputField,
	NumberInputStepper, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Portal, Select
} from '@chakra-ui/react';
import ParamListCompact from '@components/create/params/paramListCompact';
import { decode, encode } from '@gpu/params';
import * as types from '@gpu/types';
import useInstance from '@recoil/hooks/useInstance';
import { currentProjectIDAtom, projectParamKeys, projectParamsAtom } from '@recoil/project';
import { debounce } from 'lodash';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useState } from 'react';
import { HexColorPicker } from "react-colorful";
import { FaMinus, FaSearch } from 'react-icons/fa';
import { MdAdd, MdSettings } from 'react-icons/md';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { themed } from '../../../theme/theme';
import { useDebounce } from '../../../utils/lodashHooks';
import { RowButton } from '../../shared/rowButton';
import { ParamInstanceState } from '../descriptors';
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';
import { useResizeDetector } from 'react-resize-detector';
import ParamListExpanded from '@components/create/params/paramListExpanded';

const gridSpacing = [12, 8, 12, 2]
const totalGridSpace = 35

interface ParamRowProps {
	idx: number
	paramName?: string
	paramType: types.ParamType
	param: string
	onParamNameChange: (idx: number, name: string) => void
	onParamTypeChange: (idx: number, type: types.ParamType) => void
	onParamChange: (param: string) => void
	onParamDelete: (idx: number) => void
	isInvalid: boolean
}

const ParamRow = (props: ParamRowProps) => {

	let paramInput = null;

	const onHandleColorChange = debounce(props.onParamChange, 25, { leading: true, trailing: false })

	if (props.paramType === 'color') {
		paramInput =
			<Popover

			>
				<PopoverTrigger>
					<Button
						width='100%'
						height='2rem'
						justify='flex-end'
						alignItems='center'
						cursor='pointer'
						borderRadius={0}
					>
						<Input color={props.param} bg="transparent" cursor='pointer' isInvalid variant='unstyled' value={props.param} textTransform='uppercase'></Input>
					</Button>
				</PopoverTrigger>
				<Portal>
					<PopoverContent size='fit-content' bg='transparent' border='none'>
						<PopoverArrow />
						{/* <PopoverCloseButton /> */}
						<PopoverBody m={0} p={0} zIndex={4}>
							<HexColorPicker
								style={{ margin: 0 }}
								color={props.param as string}
								onChange={onHandleColorChange}
							/>
						</PopoverBody>
					</PopoverContent>
				</Portal>
			</Popover>
	} else {
		paramInput =
			<NumberInput
				value={props.param}
				onChange={(str, num) => props.onParamChange(str)}
				step={props.paramType === 'int' ? 1 : 0.05}
				size="sm"
				keepWithinRange={false}
				precision={props.paramType === 'int' ? 0 : 4}
				clampValueOnBlur={false}
				allowMouseWheel
				borderColor={themed('border')}
				bg={themed('input')}
				borderRadius="0px"
			>
				<NumberInputField />
				<NumberInputStepper>
					<NumberIncrementStepper />
					<NumberDecrementStepper />
				</NumberInputStepper>
			</NumberInput>
	}

	return (
		<Grid templateColumns={`repeat(${totalGridSpace}, 1fr)`} mb={1}>
			<GridItem colSpan={1} bg={themed('input')} borderY="1px" borderColor={themed('border')} />
			<GridItem colSpan={gridSpacing[0]}>
				<Input
					value={props.paramName}
					onChange={(ev) => props.onParamNameChange(props.idx, ev.target.value)}
					size="sm"
					placeholder="variableName"
					borderRadius={0}
					isInvalid={props.isInvalid}
				/>
			</GridItem>
			<GridItem colSpan={gridSpacing[1]}>
				<Select
					value={props.paramType}
					onChange={(ev) => props.onParamTypeChange(props.idx, ev.target.value as ParamType)}
					borderColor={themed('border')}
					bg={themed('input')}
					borderX="0px"
					size="sm"
				>
					<option value="int">Integer</option>
					<option value="float">Float</option>
					<option value="color">Color</option>
				</Select>
			</GridItem>
			<GridItem colSpan={gridSpacing[2]}>
				{paramInput}
			</GridItem>
			<GridItem colSpan={gridSpacing[3]}>
				<IconButton
					onClick={() => props.onParamDelete(props.idx)}
					size='sm'
					aria-label="Remove"
					icon={<FaMinus size={10} />}
					borderRadius={0}
					borderEndRadius={500}
					borderLeft="0px"
				/>
			</GridItem>
		</Grid>)
}

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
						icon={<MdAdd size={17} />}
						first
					/>
					<RowButton
						purpose="Options"
						icon={<MdSettings size={17} />}
						last
					/>
				</PanelBarEnd>
			</PanelBar>
		</Panel>
	)
}
export default ParamPanel

export const useParamsPanel = (): ParamPanelProps => {

	const projectID = useRecoilValue(currentProjectIDAtom)
	const [paramKeys, setParamKeys] = useRecoilState(projectParamKeys)


	const addParam = useCallback(() => {
		// setParams(oldParams => {
		// 	let newParams = [...oldParams]
		// 	newParams.push({
		// 		paramName: `param${newParams.length}`,
		// 		paramType: 'int',
		// 		param: [0]
		// 	})
		// 	return newParams
		// })

		setParamKeys(old => [...old, nanoid(8)])

	}, [setParamKeys])

	const removeParam = useCallback((key: string) => {
		setParamKeys(oldKeys => {
			let newParams = [...oldKeys]
			newParams.splice(oldKeys.indexOf(key), 1)
			return newParams
		})
	}, [setParamKeys])

	// const setParamAtIndex = useCallback((p: types.ParamDesc, idx: number, changedType: boolean) => {

	// 	if (changedType) {
	// 		if (p.paramType === 'color') {
	// 			p.param = [1, 0, 0]
	// 		} else {
	// 			p.param = [0]
	// 		}
	// 	}

	// 	setParams(oldParams => {
	// 		let newParams = [...oldParams]
	// 		newParams[idx] = p
	// 		return newParams
	// 	})
	// }, [paramsState])

	return { paramKeys, addParam, removeParam }
}

var id = 0

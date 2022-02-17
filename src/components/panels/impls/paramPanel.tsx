import { ArrowUpIcon, CloseIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Flex,
	HStack,
	Input, InputGroup,
	InputLeftElement,
	InputRightElement,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Portal,
	Stack,
	Text
} from '@chakra-ui/react';
import ParamListCompact from '@components/create/params/paramListCompact';
import useInstance from '@core/hooks/useInstance';
import { projectParamKeys, projectParamsAtom } from 'core/recoil/atoms/project';
import { nanoid } from 'nanoid';
import React, { useCallback, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { MdAdd, MdArrowDropUp, MdSettings } from 'react-icons/md';
import { useRecoilState } from 'recoil';
import { RowButton } from '../../shared/rowButton';
import { ParamInstanceState } from '../descriptors';
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';
import { useResizeDetector } from 'react-resize-detector';
import ParamListExpanded from '@components/create/params/paramListExpanded';
import { themed } from '@theme/theme';
import { typeToInterface } from '@components/create/params/paramInterface';


const InterfaceTypeSelect = (props: { selectedParam: string }) => {

	const [param, setParam] = useRecoilState(projectParamsAtom(props.selectedParam))
	const [isOpen, setOpen] = useState(false)
	const open = () => setOpen(true)
	const close = () => setOpen(false)

	const interfaces = typeToInterface[param.paramType]

	return (
		<Popover
			isOpen={isOpen}
			onClose={close}
			closeOnBlur
			preventOverflow
			matchWidth
			placement="top-start"
			offset={[5, 0]}
			gutter={0}
		>
			<PopoverTrigger>
				<HStack
					bg={themed('input')}
					pl="0.2rem"
					pr="0.5rem"
					borderStartRadius="md"
					_hover={{ bg: themed('buttonHovered') }}
					cursor="pointer"
					pos="relative"
					onClick={isOpen ? close : open}
				>
					<MdArrowDropUp />
					<Text display="inline" fontSize="xs" color={themed("textMid")}>{interfaces[param.interface ?? 0]}</Text>
				</HStack>
			</PopoverTrigger>
			<Portal>
				<PopoverContent outline="none" border="none" w="100%">
					<Flex bg={themed('a2')} flexDir="column" border="1px" borderColor={themed("borderLight")}>
						{
							interfaces.map((s, idx) => (
								<Button
									key={s}
									size="xs"
									width="100%"
									borderRadius="0"
									fontWeight="normal"
									onClick={() => {
										setParam(old => ({ ...old, interface: idx }))
										close()
									}}
								>
									{s}
								</Button>
							))
						}

					</Flex>
				</PopoverContent>
			</Portal>
		</Popover>
	)
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
					{
						selectedParam && <InterfaceTypeSelect selectedParam={selectedParam} />
					}

					<RowButton
						purpose="Add param"
						onClick={addParam}
						icon={<MdAdd />}
						first={!selectedParam}
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

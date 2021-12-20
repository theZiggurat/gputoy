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
import { decode, encode } from '@gpu/params';
import * as types from '@gpu/types';
import useInstance from '@recoil/hooks/useInstance';
import { currentProjectIDAtom, projectParamsAtom } from '@recoil/project';
import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { HexColorPicker } from "react-colorful";
import { FaMinus, FaSearch } from 'react-icons/fa';
import { MdAdd, MdSettings } from 'react-icons/md';
import { useRecoilState, useRecoilValue } from 'recoil';
import { themed } from '../../../theme/theme';
import { useDebounce } from '../../../utils/lodashHooks';
import { RowButton } from '../../shared/rowButton';
import { ParamInstanceState } from '../descriptors';
import { Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';

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
    params: types.ParamDesc[],
    addParam: () => void,
    deleteParam: (idx: number) => void,
    setParamAtIndex: (p: types.ParamDesc, idx: number, changedType: boolean) => void,
}

const ParamPanel = (props: ParamPanelProps) => {

    const { params, addParam, deleteParam, setParamAtIndex } = useParamsPanel()

    const { ...panelProps } = props

    const [instanceState, setInstanceState] = useInstance<ParamInstanceState>(props)

    const setKeywordFilter = (filter: string) => setInstanceState({ ...instanceState, keywordFilter: filter })
    const setNameErrors = (errors: boolean[]) => setInstanceState({ ...instanceState, nameErrors: errors })

    const onHandleParamNameChange = (idx: number, paramName: string) =>
        setParamAtIndex({ ...params[idx], paramName }, idx, false)

    const onHandleParamTypeChange = (idx: number, paramType: types.ParamType) =>
        setParamAtIndex({ ...params[idx], paramType }, idx, true)

    useDebounce(() => setNameErrors(params.map(p => !(/^[a-z0-9]+$/i.test(p.paramName)))), 500, [params])

    return (
        <Panel {...panelProps}>
            <PanelContent>
                <Flex direction="column" minWidth={500}>
                    <Grid
                        templateColumns={`repeat(${totalGridSpace}, 1fr)`}
                        position="sticky"
                        top={0}
                        borderBottom="1px"
                        borderColor={themed('border')}
                        zIndex={1}
                    >
                        <GridItem colSpan={1} bg={themed('a1')} />
                        <GridItem colSpan={gridSpacing[0]} pl="0.8rem" fontSize="smaller" bg={themed('a1')}>
                            Name
                        </GridItem>
                        <GridItem colSpan={gridSpacing[1]} pl="0.2rem" fontSize="smaller" bg={themed('a1')}>
                            Type
                        </GridItem>
                        <GridItem colSpan={gridSpacing[2]} fontSize="smaller" bg={themed('a1')}>
                            Value
                        </GridItem>
                        <GridItem colSpan={gridSpacing[3]} bg={themed('a1')} />
                    </Grid>
                    <Flex flex="1 0 auto" direction="column" mt="1" pr={5}>
                        {
                            params.map((p, idx) =>
                                p.paramName.match(new RegExp(instanceState.keywordFilter, 'i')) &&
                                <ParamRow
                                    key={idx}
                                    idx={idx}
                                    param={encode(p.param, p.paramType)}
                                    paramType={p.paramType}
                                    paramName={p.paramName}
                                    onParamChange={(val: string) => setParamAtIndex({ ...p, param: decode(val, p.paramType) }, idx, false)}
                                    onParamNameChange={onHandleParamNameChange}
                                    onParamTypeChange={onHandleParamTypeChange}
                                    onParamDelete={deleteParam}
                                    isInvalid={instanceState.nameErrors[idx]}
                                />
                            )
                        }
                    </Flex>
                </Flex>
            </PanelContent>
            <PanelBar>
                <PanelBarMiddle>
                    <InputGroup size="sm" variant="filled" maxWidth="500" minWidth="100" >
                        <InputLeftElement
                            children={<FaSearch />}
                        />
                        <Input
                            borderRadius="lg"
                            value={instanceState.keywordFilter}
                            onChange={ev => setKeywordFilter(ev.target.value)}
                        />
                        {
                            instanceState.keywordFilter.length > 0 &&
                            <InputRightElement
                                children={<CloseIcon size="sm" />}
                                onClick={() => setKeywordFilter('')}
                            />
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
    const [paramsState, setParams] = useRecoilState<types.ParamDesc[]>(projectParamsAtom(projectID))


    const addParam = useCallback(() => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.push({
                paramName: `param${newParams.length}`,
                paramType: 'int',
                param: [0]
            })
            return newParams
        })

    }, [paramsState])

    const deleteParam = useCallback((idx: number) => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.splice(idx, 1)
            return newParams
        })
    }, [paramsState])

    const setParamAtIndex = useCallback((p: types.ParamDesc, idx: number, changedType: boolean) => {

        if (changedType) {
            if (p.paramType === 'color') {
                p.param = [1, 0, 0]
            } else {
                p.param = [0]
            }
        }

        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams[idx] = p
            return newParams
        })
    }, [paramsState])

    return { params: paramsState, addParam, deleteParam, setParamAtIndex }
}

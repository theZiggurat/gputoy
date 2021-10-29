import React, { useEffect } from 'react';
import { 
    useColorModeValue,
    chakra, 
    Flex, 
    IconButton, 
    Divider, 
    Input, 
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper, 
    Center,
    Text,
    Portal,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
} from '@chakra-ui/react'

import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
  } from "@chakra-ui/react"
import {FaPlay, FaStop, FaPause, FaPlus, FaMinus} from 'react-icons/fa'

import { HexColorPicker } from "react-colorful";
import Project from '../../gpu/project';
import {ParamType, ParamDesc} from '../../gpu/params'
import WorkingProject from '../../gpu/project'


interface TableRowProps {
    idx: number
    paramName?: string
    paramType: ParamType
    param: string
    onParamNameChange: (name: string) => void
    onParamTypeChange: (type: ParamType) => void
    onParamChange: (param: string) => void
    onParamDelete: (idx: number) => void
}

const TableRow = (props: TableRowProps) => {

    const [max, setMax] = React.useState(100)
    const [min, setMin] = React.useState(0)

    let paramInput = null;

    const checkAndApplyColor = (color: string) => {

    }

    if (props.paramType === 'color') {
        paramInput = 
        <Popover 
            computePositionOnMount 
            placement='auto'
        >
            <PopoverTrigger>
                <Button 
                    bgGradient={`linear(to-r, rgba(0,0,0,0) 30%, ${props.param})`} 
                    width='100%' 
                    height='2rem' 
                    borderRadius='sm' 
                    justify='flex-end'
                    alignItems='center'
                    //border={`${useColorModeValue('#EDF2F7', '#232934')} 5px solid`}
                    cursor='pointer'
                >
                    <Input cursor='pointer' isInvalid variant='unstyled' value={props.param} textTransform='uppercase'></Input>
                </Button>
            </PopoverTrigger>
            <Portal>
                <PopoverContent size='fit-content' bg='transparent' border='none'>
                    <PopoverArrow/>
                    {/* <PopoverCloseButton /> */}
                    <PopoverBody m={0} p={0}>
                            <HexColorPicker style={{margin:0}} color={props.param as string} onChange={props.onParamChange}/>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    } else {
        paramInput = 
        <NumberInput
            value={props.param}
            onChange={(str, num) => props.onParamChange(str)}
            min={min}
            max={max}
            step={props.paramType === 'int' ? 1: (max - min)/100.0}
            size="sm"
            variant="filled"
            keepWithinRange={false}
            precision={props.paramType==='int'?0:4}
            clampValueOnBlur={false}
            allowMouseWheel
        >
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    }

    return (<Tr>
        <Td w="25%">
            <Input 
                value={props.paramName}
                onChange={(ev) => props.onParamNameChange(ev.target.value)}
                variant="filled" 
                size="sm" 
                placeholder="variableName" 
            />
        </Td>
        <Td w="20%">
            <Select 
                value={props.paramType}
                onChange={(ev) => props.onParamTypeChange(ev.target.value as ParamType)}
                variant="filled" 
                size="sm" 
            >
                <option value="int">Integer</option>
                <option value="float">Float</option>
                <option value="color">Color</option>
            </Select>
        </Td>
        <Td w="25%">
            {paramInput}
        </Td>
        <Td w="5%">
            <Input
                value={min}
                onChange={(ev) => setMin(Number(ev.target.value))}
                size="sm"
                variant="filled"
                type="number"
            />
        </Td>
        <Td w="5%">
            <Input
                value={max}
                onChange={(ev) => setMax(Number(ev.target.value))}
                size="sm"
                variant="filled"
                type="number"
            />
        </Td>
        <Td w='2%'>
            <IconButton
                onClick={() => props.onParamDelete(props.idx)}
                size='xs'
                variant='unstyled'
                aria-label="Remove"
                icon={<FaMinus/>}
            />
        </Td>
        
    </Tr>)
}

const StatusInfo = (props: {text: string, textColor?: string}) => (
    <Center mr={3} 
        backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')} 
        fontFamily='"Fira code", "Fira Mono", monospace'
        borderRadius={2}
        userSelect="none"
    >
        <Text pl={2} pr={2} fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)

const scrollBarCss = {
    '&::-webkit-scrollbar': {
        width: '0px',
    },
}

interface ParamsPanelProps {
    onRequestStart?: () => void,
    onRequestPause?: () => void,
    onRequestStop?: () => void,
    onParamChange?: (params: ParamDesc[]) => void,
    disabled: boolean
}

const ParamsPanel = (props: ParamsPanelProps) => {

    const [params, setParams] = React.useState<ParamDesc[]>([])
    const [projectStatus, setProjectStatus] = React.useState({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

    const setParamAtIndex = (p: ParamDesc, idx: number, changedType: boolean) => {

        if (changedType) {
            if (p.paramType === 'color') {
                p.param = '#FF0000'
            } else {
                p.param = '0'
            }
        }

        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams[idx] = p
            return newParams
        })
    }

    const addNewParam = () => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.push({
                paramName: `param${newParams.length}`,
                paramType: 'int',
                param: '0'
            })
            return newParams
        })
    }

    const deleteParam = (idx: number) => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.splice(idx, 1)
            return newParams
        })
    }

    useEffect(() => props.onParamChange(params), [params])

    useEffect(() => {
        const id = setInterval(() => {
            let fps = '--'
            if (WorkingProject.dt != 0) {
                fps = (1 / WorkingProject.dt * 1000).toFixed(2).toString()
            }

            setProjectStatus(oldStatus => {
                let newStatus = {
                    gpustatus: WorkingProject.status,
                    fps: fps,
                    time: (WorkingProject.runDuration).toFixed(1).toString()
                }
                return newStatus
            })
        },(100))
        return () => clearInterval(id)
    },[])

    return(
        <Flex direction="column" maxHeight="100%">
            <Flex m={3} flex="0 0 auto" justifyContent='space-between'>
                <Flex>
                    <IconButton 
                        size="sm"
                        aria-label="Play"
                        marginRight={3}
                        icon={<FaPlay/>} 
                        onClick={props.onRequestStart}
                        disabled={props.disabled}
                        />
                    <IconButton 
                        size="sm"
                        aria-label="Pause"
                        marginRight={3}
                        icon={<FaPause/>} 
                        onClick={props.onRequestPause}
                        disabled={props.disabled}
                        />
                    <IconButton 
                        size="sm"
                        aria-label="Stop"
                        marginRight={3}
                        icon={<FaStop/>} 
                        onClick={props.onRequestStop}
                        disabled={props.disabled}
                        />
                    <IconButton 
                        size="sm"
                        aria-label="Add"
                        marginRight={3}
                        icon={<FaPlus/>} 
                        onClick={addNewParam}
                        disabled={props.disabled}
                        />
                </Flex>
                <Flex>
                    <StatusInfo text={`FPS: ${projectStatus.fps}`}/>
                    <StatusInfo text={`Duration: ${projectStatus.time}s`}/>
                    <StatusInfo text={`Status: ${projectStatus.gpustatus}`}/>
                </Flex>
            </Flex>
            <Divider></Divider>
            <chakra.div flex="1 1 auto" overflowY="scroll" css={scrollBarCss}>
                <Table variant="simple" overflowY="auto" maxHeight="100%" size={'sm'}>
                    <Thead>
                        <Th>Variable name</Th>
                        <Th>Type</Th>
                        <Th>Value</Th>
                        <Th>Min</Th>
                        <Th>Max</Th>
                        <Th></Th>
                    </Thead>
                    <Tbody>
                    {
                        params.map((p: ParamDesc, idx: number) => 
                            <TableRow
                                key={idx}
                                idx={idx}
                                param={p.param}
                                paramType={p.paramType}
                                paramName={p.paramName}
                                onParamChange={(param: string) => setParamAtIndex({...p, param}, idx, false)}
                                onParamNameChange={(paramName: string) => setParamAtIndex({...p, paramName}, idx, false)}
                                onParamTypeChange={(paramType: ParamType) => setParamAtIndex({...p, paramType}, idx, true)}
                                onParamDelete={deleteParam}
                            />
                        )
                    }
                    </Tbody>
                </Table>
            </chakra.div>
        </Flex>
    )
}

export default ParamsPanel
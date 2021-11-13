import React, { useEffect } from 'react';
import { 
    IconButton, 
    Input, 
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper, 
    Portal,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
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
import {FaMinus} from 'react-icons/fa'
import { HexColorPicker } from "react-colorful";
import {ParamType, ParamDesc} from '../../gpu/params'


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
                disabled={props.paramType=='color'}
                readOnly={props.paramType=='color'}
            />
        </Td>
        <Td w="5%">
            <Input
                value={max}
                onChange={(ev) => setMax(Number(ev.target.value))}
                size="sm"
                variant="filled"
                type="number"
                disabled={props.paramType=='color'}
                readOnly={props.paramType=='color'}
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

interface ParamPanelProps {
  setParamAtIndex: (p: ParamDesc, idx: number, changedType: boolean) => void,
  deleteParam: (idx: number) => void,
  params: ParamDesc[],
}

const ParamPanel = (props: ParamPanelProps) => {
  return (
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
            props.params.map((p: ParamDesc, idx: number) => 
                <TableRow
                    key={idx}
                    idx={idx}
                    param={p.param}
                    paramType={p.paramType}
                    paramName={p.paramName}
                    onParamChange={(param: string) => props.setParamAtIndex({...p, param}, idx, false)}
                    onParamNameChange={(paramName: string) => props.setParamAtIndex({...p, paramName}, idx, false)}
                    onParamTypeChange={(paramType: ParamType) => props.setParamAtIndex({...p, paramType}, idx, true)}
                    onParamDelete={props.deleteParam}
                />
            )
        }
        </Tbody>
    </Table>
  )
}

export default ParamPanel

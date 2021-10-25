import React, { useState } from 'react';
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
    Text
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
import {FaPlay, FaStop, FaPause} from 'react-icons/fa'

const StatusInfo = (props: {text: string, textColor?: string}) => (
    <Center mr={3} 
        backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')} 
        fontFamily='"Fira code", "Fira Mono", monospace'
        borderRadius={5}
        userSelect="none"
    >
        <Text pl={2} pr={2} fontSize={12} color={props.textColor}>{props.text}</Text>
    </Center>
)


type ParamValue = number | string

const TableRow = () => {

    const [varType, setVarType] = useState('int');
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(99);
    const [value, setValue] = useState<ParamValue>(0)

    return (<Tr>
        <Td w="25%">
            <Input variant="filled" size="sm" placeholder="variableName" onSelect={(val) => {
                console.log(varType)
                setVarType(val)
            }}/>
        </Td>
        <Td w="20%">
            <Select variant="filled" size="sm" onCh>
                <option value="int">Integer</option>
                <option value="float">Float</option>
                <option value="color">Color</option>
            </Select>
        </Td>
        <Td w="25%">
            <NumberInput
                size="sm"
                variant="filled"
                min={min}
                max={max}
                step={varType === 'int' ? 1: (max - min)/100}
                keepWithinRange={false}
                clampValueOnBlur
                allowMouseWheel
                onChange={(str, num) => {
                    console.log(value)
                    setValue(num)
                }}
            >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Td>
        <Td w="5%">
            <Input
            size="sm"
            variant="filled"
            type="number"
            defaultValue={9}
            max={10}
            keepWithinRange={false}
            clampValueOnBlur={false}
            />
        </Td>
        <Td w="5%">
            5
        </Td>
    </Tr>)
}

interface ParamsPanelProps {
    onRequestStart?: () => void,
    onRequestPause?: () => void,
    onRequestStop?: () => void,
}

const scrollBarCss = {
    '&::-webkit-scrollbar': {
        width: '0px',
    },
}

const ParamsPanel = (props: ParamsPanelProps) => {

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
                        />
                    <IconButton 
                        size="sm"
                        aria-label="Pause"
                        marginRight={3}
                        icon={<FaPause/>} 
                        onClick={props.onRequestPause}
                        />
                    <IconButton 
                        size="sm"
                        aria-label="Stop"
                        marginRight={3}
                        icon={<FaStop/>} 
                        onClick={props.onRequestStop}
                        />
                </Flex>
                <Flex>
                    <StatusInfo text='FPS: --'/>
                    <StatusInfo text='Duration: --'/>
                    <StatusInfo text='Status: OK'/>
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
                    </Thead>
                    <Tbody>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                        <TableRow/>
                    </Tbody>
                </Table>
            </chakra.div>
        </Flex>
    )
}

export default ParamsPanel
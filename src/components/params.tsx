import React from 'react';
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
} from '@chakra-ui/react'

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    Select,
  } from "@chakra-ui/react"
import {FaPlay, FaStop, FaPause} from 'react-icons/fa'


const TableRow = () => (
    <Tr>
        <Td w="25%">
            <Input variant="filled" size="sm" placeholder="variableName"/>
        </Td>
        <Td w="20%">
            <Select variant="filled" size="sm" placeholder="Select Type">
            <option value="int">Integer</option>
            <option value="float">Float</option>
            <option value="array">Array</option>
            </Select>
        </Td>
        <Td w="25%">
            <NumberInput
            size="sm"
            variant="filled"
                defaultValue={9}
                max={10}
                keepWithinRange={false}
                clampValueOnBlur={false}
                >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Td>
        <Td w="5%">
            5
        </Td>
        <Td w="5%">
            5
        </Td>
        <Td w="5%">
            5
        </Td>

    </Tr>
)

interface ParamsPanelProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
}

const ParamsPanel = (props: ParamsPanelProps) => {

    return(
        <Flex direction="column" maxHeight="100%">
            <Flex m={3} flex="0 0 auto">
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
            <Divider></Divider>
            <chakra.div flex="1 1 auto" overflowY="scroll">
                <Table variant="simple" overflowY="auto" maxHeight="100%" >
                    <Thead>
                        <Th>Variable name</Th>
                        <Th>Type</Th>
                        <Th>Value</Th>
                        <Th>Min</Th>
                        <Th>Max</Th>
                        <Th>Step</Th>
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
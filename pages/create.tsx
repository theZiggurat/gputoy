import React from 'react'
import { 
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
import Scaffold from '../src/components/scaffold'
import Canvas from '../src/components/canvas'
import CodeEditor from '../src/components/editor'
import SplitPane from 'react-split-pane'
import WGPUContext from '../src/wgpu_context'
import {FaPlay, FaStop, FaPause} from 'react-icons/fa'

const ControlPanel = () => {

    

    const onStartClick = () => {
        WGPUContext.start()
    }

    const onStopClick = () => {
        WGPUContext.stop()
    }

    const onResetClick = () => {

    }

    return(
        <Flex direction="column">
            <Flex m={3}>
                <IconButton 
                    size="sm"
                    aria-label="Play"
                    marginRight={3}
                    icon={<FaPlay/>} 
                    onClick={onStartClick}
                    />
                <IconButton 
                    size="sm"
                    aria-label="Pause"
                    marginRight={3}
                    icon={<FaPause/>} 
                    onClick={onStopClick}
                    />
                <IconButton 
                    size="sm"
                    aria-label="Reset"
                    marginRight={3}
                    icon={<FaStop/>} 
                    onClick={onStartClick}
                    />
            </Flex>
            <Divider></Divider>
            <Flex m={3} direction="column">
                <Flex direction="row">
                    <Input placeholder="param1" m={2}></Input>
                    <NumberInput m={2}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </Flex>

            </Flex>
        </Flex>
    )
}

const Create = () => {

    return (
        <Scaffold>
            <chakra.div flex="1 1 auto">
                <SplitPane split="vertical" minSize='50%' defaultSize='60%' 
                    className="createWindow" maxSize="100%">
                    <SplitPane split="horizontal" defaultSize="50%">
                        <chakra.div height="100%" width="100%">
                            <Canvas></Canvas>
                        </chakra.div>
                        <ControlPanel/>
                    </SplitPane>
                        <CodeEditor/>
                </SplitPane>
            </chakra.div>
        </Scaffold>
    )
}
export default Create;




import React, { useEffect } from 'react';
import { 
    useColorModeValue,
    chakra, 
    Flex, 
    IconButton, 
    Divider,
    Center,
    Text,
    Button,
} from '@chakra-ui/react'

import {FaPlay, FaStop, FaPause, FaPlus, FaUpload} from 'react-icons/fa'

import {ParamType, ParamDesc} from '../../gpu/params'
import WorkingProject from '../../gpu/project'
import ParamPanel from './multipanel/parampanel'
import ConsolePanel from './multipanel/console'

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

const StatusBarTab = (props: {name: string, index: number, setIndex: (idx: number)=>void, currentIndex: number} ) => (
    <Button 
        m='1px'
        mt='0px'
        backgroundColor={props.currentIndex == props.index ? useColorModeValue("gray.150", "gray.900"): useColorModeValue("gray.50", "gray.800")}
        variant="unstyled"
        borderRadius={0}
        p={4}
        height="100%"
        onClick={() => props.setIndex(props.index)}
    >
        {props.name}
    </Button>
)

interface MultiPanelProps {
    onRequestStart: () => void,
    onRequestPause: () => void,
    onRequestStop: () => void,
    onParamChange: (params: ParamDesc[], updateDesc: boolean) => void,
    disabled: boolean
}

const MultiPanel = (props: MultiPanelProps) => {

    const [params, setParams] = React.useState<ParamDesc[]>([])
    const [projectStatus, setProjectStatus] = React.useState({
        gpustatus: "",
        fps: "--",
        time: "--",
    })

    const [viewIndex, setViewIndex] = React.useState(1)

    const setParamAtIndex = (p: ParamDesc, idx: number, changedType: boolean) => {

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
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
    }

    const addNewParam = () => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.push({
                paramName: `param${newParams.length}`,
                paramType: 'int',
                param: [0]
            })
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
        
    }

    const deleteParam = (idx: number) => {
        setParams(oldParams => {
            let newParams = [...oldParams]
            newParams.splice(idx, 1)
            window.localStorage.setItem('params', JSON.stringify(newParams))
            return newParams
        })
    }

    useEffect(() => {
        props.onParamChange(params, true)
    }, [params])

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

    useEffect(() => {
        let params = window.localStorage.getItem('params')
        if (params) 
            setParams(JSON.parse(params))
    }, [])

    const views = [
        <ParamPanel
            setParamAtIndex={setParamAtIndex}
            deleteParam={deleteParam}
            params={params}
        ></ParamPanel>,
        <ConsolePanel/>
    ]

    

    return(
        
        <Flex direction="column" maxHeight="100%" height="100%">
            <Flex flex="0 0 auto" justifyContent='space-between'>
                <Flex m={3}>
                    <IconButton 
                        size="sm"
                        aria-label="Play"
                        marginRight={3}
                        icon={WorkingProject.shaderDirty ? <FaUpload/> : WorkingProject.running ? <FaPause/>:<FaPlay/>} 
                        onClick={WorkingProject.running ? props.onRequestPause : props.onRequestStart}
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
                <Flex  backgroundColor="whiteAlpha.200">
                    <StatusBarTab name="Params" index={0} setIndex={setViewIndex} currentIndex={viewIndex}/>
                    <StatusBarTab name="Console" index={1} setIndex={setViewIndex} currentIndex={viewIndex}/>
                </Flex>
                    
                <Flex m={3}>
                    <StatusInfo text={`FPS: ${projectStatus.fps}`}/>
                    <StatusInfo text={`Duration: ${projectStatus.time}s`}/>
                    <StatusInfo text={`Status: ${projectStatus.gpustatus}`}/>
                </Flex>
            </Flex>
            <Divider></Divider>
            <chakra.div flex="1 1 auto" overflowY="scroll" css={scrollBarCss}>
                {views[viewIndex]}
            </chakra.div>
        </Flex>
        
    )
}

export default MultiPanel
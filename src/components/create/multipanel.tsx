import React, { useEffect } from 'react';
import { 
    useColorModeValue,
    Button,
} from '@chakra-ui/react'



import { ParamDesc } from '../../gpu/params'
import ParamPanel from './paramPanel'
import ConsolePanel from './consolePanel'
import Panel from '../panel'

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
    params: ParamDesc[],
    onParamChange: (params: ParamDesc[], updateDesc: boolean) => void,
    setParamAtIndex: (p: ParamDesc, idx: number, changedType: boolean) => void,
    addNewParam: () => void,
    deleteParam: (idx: number) => void
}

const MultiPanel = (props: MultiPanelProps) => {

    const [viewIndex, setViewIndex] = React.useState(1)

    const views = [
        <ParamPanel
            setParamAtIndex={props.setParamAtIndex}
            deleteParam={props.deleteParam}
            params={props.params}
        />,
        <ConsolePanel/>
    ]

    return views[viewIndex]
}

export default MultiPanel
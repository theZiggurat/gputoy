import React from 'react'
import { 
    chakra, 
} from '@chakra-ui/react'
import Scaffold from '../src/components/scaffold'
import Canvas from '../src/components/canvas'
import CodeEditor from '../src/components/create/editor'
import SplitPane from 'react-split-pane'
import WGPUContext from '../src/wgpu_context'
import ParamsPanel from '../src/components/create/params'

const Create = () => {

    return (
        <Scaffold>
            <SplitPane split="vertical" minSize='50%' defaultSize='60%' 
                className="createWindow" maxSize="100%">
                <SplitPane split="horizontal" defaultSize="50%">
                    <chakra.div height="100%" width="100%">
                        <Canvas></Canvas>
                    </chakra.div>
                    <ParamsPanel/>
                </SplitPane>
                    <CodeEditor/>
            </SplitPane>
        </Scaffold>
    )
}
export default Create;




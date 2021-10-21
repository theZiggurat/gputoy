import React, { useEffect } from 'react'
import { chakra } from '@chakra-ui/system';
import WGPUContext from '../../src/wgpu_context'
import styles from '../../styles/Home.module.css'


export default function Canvas() {

    const id = "canvas";

    // useEffect(() => {
    //     WGPUContext.registerCanvas(id);
    // })

    var onclick = () => {
        WGPUContext.registerCanvas(id);
    }

    return (
        <chakra.div
            backgroundColor="black" flex="1 1 auto" minH={200}>
            <chakra.button position="absolute" left={500} top={500} onClick={onclick}>Start</chakra.button>
            <canvas id={id} className={styles.background}/>
        </chakra.div>
        
    );
    
}
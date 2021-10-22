import React, { useEffect } from 'react'
import { chakra } from '@chakra-ui/system';
import WGPUContext from '../wgpu_context'
import styles from '../../styles/Home.module.css'


export default function Canvas() {

    const id = "canvas";

    useEffect(() => {
        WGPUContext.registerCanvas(id)
    }, [])

    var onStartClick = () => {
        console.log("starting")
        WGPUContext.start!()
    }

    var onStopClick = () => {
        WGPUContext.stop!()
    }

    return (
        <chakra.div
             backgroundColor="black" height="100%">
            <canvas id={id} className={styles.background}/>
        </chakra.div>
        
    );
    
}
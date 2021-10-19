import React, { useEffect } from 'react'
import WGPUContext from '../../src/wgpu_context'
import styles from '../../styles/Home.module.css'


export default function Canvas() {

    const id = "canvas";

    useEffect(() => {
        WGPUContext.registerCanvas(id);
    })

    return (
        <canvas id={id} className={styles.background}/>
    );
    
}
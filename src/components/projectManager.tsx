import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useLogger } from '../recoil/console'
import GPU from '../gpu/gpu'
import { Project } from '../gpu/project'
import { projectStatus } from '../recoil/project'


const ProjectManager = () => {

  const [projectStatusState, setProjectStatus] = useRecoilState(projectStatus)
  const [isRunningState, setRunningState] = useState(false)
  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  const f = () => {

    Project.instance().renderInternal()

    setProjectStatus(old => { 
      let now = performance.now()
      return {
        ...old,
        runDuration: (now - old.lastStartTime) / 1000 + old.prevDuration,
        lastFrameRendered: now,
        dt: now - old.lastFrameRendered,
        frameNum: old.frameNum + 1
      }
    })



    if (isRunning.current)
      intervalHandle.current = window.requestAnimationFrame(f)
  }

  const errorHandler = (ev: GPUUncapturedErrorEvent) => {
    let message: string = ev.error.message

    // shader error
    if (message.startsWith('Tint WGSL reader failure')) {
      
      let start = message.indexOf(':')+1
      let body = message.substr(start, message.indexOf('Shader')-start).trim()
      logger.err("Shader error", body)
    }
    else if (message.startsWith('[ShaderModule] is an error.')) {
      logger.err("Shader module", message)
    }
    else {
      logger.err("Unknown error", message)
      
    }
    if (isRunning.current)
      setRunningState(false)
  }

  useEffect(() => {
    if (GPU.isInitialized())
      GPU.device.onuncapturederror = errorHandler
  }, [])


  useLayoutEffect(() => {
    if (isRunning.current) {
      Project.instance().run(logger)
      window.requestAnimationFrame(f)
    }

      
    return () => cancelAnimationFrame(intervalHandle.current)
  }, [isRunningState])

  // syncs the isRunning ref with recoil global projectStatus state
  // and triggers above layhout effect to run on switching projectStatus.running false -> true
  useLayoutEffect(() => {
    if (isRunning.current != projectStatusState.running) {
      isRunning.current = projectStatusState.running
    }
    setRunningState(projectStatusState.running)
    
  }, [projectStatusState])

  return <></>
}

export default ProjectManager
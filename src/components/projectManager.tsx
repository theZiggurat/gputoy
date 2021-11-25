import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useLogger } from '../recoil/console'

import GPU from '../gpu/gpu'
import useGPUError from '../gpu/error'

import { Project } from '../gpu/project'
import { canvasInitialized, codeFiles, defaultParams, params, projectStatus } from '../recoil/project'



const ProjectManager = () => {

  const [projectStatusState, setProjectStatus] = useRecoilState(projectStatus)
  const isCanvasInitialized = useRecoilValue(canvasInitialized)
  const defaultParamState = useRecoilValue(defaultParams)
  const paramState = useRecoilValue(params)
  const files = useRecoilValue(codeFiles)


  const [isRunningState, setRunningState] = useState(false)
  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  const f = () => {

    Project.instance().renderFrame()

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

  useEffect(() => {
    if (isRunning.current) {
      if (Project.instance().prepareRun(projectStatusState, logger))
        window.requestAnimationFrame(f)
      else {
        setProjectStatus(old => { 
          return {
          ...old,
          running: false,
          frameNum: 0,
          runDuration: 0,
          prevDuration: 0,
      }})
      }
    }

    return () => cancelAnimationFrame(intervalHandle.current)
  }, [isRunningState])

  // syncs the isRunning ref with recoil global projectStatus state
  // and triggers above layhout effect to run on switching projectStatus.running false -> true
  useEffect(() => {
    if (isRunning.current != projectStatusState.running) {
      isRunning.current = projectStatusState.running
    }
    setRunningState(projectStatusState.running)
  }, [projectStatusState])



  useEffect(() => {
    Project.instance().updateDefaultParams(defaultParamState, logger)
    if(projectStatusState.frameNum > 0 && !projectStatusState.running)
    {
      Project.instance().renderFrame()
    }
      
    
  }, [defaultParamState])

  useEffect(() => {
    Project.instance().updateParams(paramState, logger)
    if(projectStatusState.frameNum > 0 && !projectStatusState.running) 
      Project.instance().renderFrame()
  }, [paramState, isCanvasInitialized])

  useEffect(() => {
    Project.instance().updateShaders(files, logger)
  }, [files])



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
    setProjectStatus(old => { 
      return {
      ...old,
      running: false,
      frameNum: 0,
      runDuration: 0,
      prevDuration: 0,
  }})
  }

  useEffect(() => {
    if (GPU.isInitialized())
      GPU.device.onuncapturederror = errorHandler
  }, [])

  return <></>
}

export default ProjectManager

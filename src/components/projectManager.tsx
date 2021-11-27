import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useLogger } from '../recoil/console'

import GPU from '../gpu/gpu'
import useGPUError from '../gpu/error'

import { Project } from '../gpu/project'
import { canvasInitialized, codeFiles, defaultParams, fileErrors, params, projectControl, projectStatus, useProjectControls } from '../recoil/project'
import { includes, throttle } from 'lodash'



const ProjectManager = () => {

  const projectStatusState= useRecoilValue(projectStatus)
  const projectControlStatus = useRecoilValue(projectControl)
  const isCanvasInitialized = useRecoilValue(canvasInitialized)
  const setFileError = useSetRecoilState(fileErrors)
  const { play, pause, stop, step } = useProjectControls()

  const defaultParamState = useRecoilValue(defaultParams)
  const paramState = useRecoilValue(params)
  const files = useRecoilValue(codeFiles)

  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  /**
   * One iteration of the render loop
   */
  const renderStep = () => {
    if (isRunning.current) {
      step()
      Project.instance().renderFrame()
      intervalHandle.current = window.requestAnimationFrame(renderStep)
    }
  }

  /**
   * Handle play/pause/stop signals from the viewport panel
   */
  useEffect(() => {
    if (projectControlStatus == 'play') {
      play()
      isRunning.current = true
      if (Project.instance().prepareRun(projectStatusState, logger, setFileError)) 
        window.requestAnimationFrame(renderStep)
      else {

        stop()
      }
        
      return () => cancelAnimationFrame(intervalHandle.current)
    } 
    if (projectControlStatus == 'pause') {
      pause()
      isRunning.current = false
    } 
    if (projectControlStatus == 'stop') {
      stop()
      isRunning.current = false
    } 
  }, [projectControlStatus])


  /**
   * Handle uniform and shader updates
   * Apply these to the project instance once their respective recoil states have changed
   */
  useEffect(() => {
    Project.instance().updateDefaultParams(defaultParamState, logger)
    if(projectStatusState.frameNum > 0 && !projectStatusState.running){
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
    let error = ev.error
    if (error instanceof GPUOutOfMemoryError) {
      logger.fatal('GPU', 'Out of memory')
      return
    }
    let message: string = error.message
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
    stop()
  }

  useEffect(() => {
    if (GPU.isInitialized())
      GPU.device.onuncapturederror = errorHandler
  }, [])

  return <></>
}

export default ProjectManager

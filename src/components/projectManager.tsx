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
      Project.instance().prepareRun(projectStatusState, logger)
      window.requestAnimationFrame(f)
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
  }, [defaultParamState])

  useEffect(() => {
    Project.instance().updateParams(paramState, logger)
  }, [paramState, isCanvasInitialized])

  useEffect(() => {
    Project.instance().updateShaders(files, logger)
  }, [files])



  useGPUError(isRunning, setRunningState, logger)

  return <></>
}

export default ProjectManager

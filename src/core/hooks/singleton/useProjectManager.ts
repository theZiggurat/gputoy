import { useCallback, useEffect, useRef } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"

import useLogger from "../useLogger"
import useProjectControls from "../useProjectControls"
import { useClearConsole } from "@core/hooks/useConsole"
import { ProjectControl, projectRunStatusAtom } from "@core/recoil/atoms/controls"
import {
  canvasInitializedAtom,
  currentProjectIdAtom,
  projectShaderErrorsAtom,
  withDefaultParams,
  withParamsJSON
} from "@core/recoil/atoms/project"
import { gpuStatusAtom } from "@core/recoil/atoms/gpu"
import { withProjectFilesJSON } from "@core/recoil/atoms/files"
import { debounce } from "lodash"
import * as types from "@core/types"
import System from "@core/system"




const useProjectManager = () => {

  const projectRunStatus = useRecoilValue(projectRunStatusAtom)

  const isCanvasInitialized = useRecoilValue(canvasInitializedAtom)
  const setFileError = useSetRecoilState(projectShaderErrorsAtom)
  const gpuStatus = useRecoilValue(gpuStatusAtom)
  const defaultParamState = useRecoilValue(withDefaultParams)
  const paramState = useRecoilValue(withParamsJSON)

  const projectID = useRecoilValue(currentProjectIdAtom)

  const { controlStatus, play, pause, stop } = useProjectControls()
  const { _smPlay, _smPause, _smStop, _smStep } = useProjectStateMachine()

  const files = useRecoilValue(withProjectFilesJSON)

  const setClearConsole = useClearConsole()

  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  useEffect(() => {
    console.log('PROJECT', 'STARTING')
    return () => console.log('PROJECT', 'ENDING')
  }, [])

  /**
   * Handle play/pause/stop signals from the viewport panel
   */
  useEffect(() => {

    const renderStep = () => {
      if (isRunning.current) {
        _smStep()
        //Project.instance().renderFrame()
        intervalHandle.current = window.requestAnimationFrame(renderStep)
      }
    }

    const onControlChange = async () => {
      if (controlStatus == ProjectControl.PLAY) {
        _smPlay()
        isRunning.current = true

        if (await System.instance().build(logger))
          window.requestAnimationFrame(renderStep)
        else {
          stop()
        }

        return () => cancelAnimationFrame(intervalHandle.current)
      }
      if (controlStatus == ProjectControl.PAUSE) {
        _smPause()
        isRunning.current = false
      }
      if (controlStatus == ProjectControl.STOP) {
        _smStop()
        isRunning.current = false
      }
    }
    onControlChange()
  }, [controlStatus])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processFileDelta = useCallback(debounce((files: { [key: string]: types.File; }) => {

    const currentFiles = System.instance().files
    console.log('PUSHING SYSTEM FILE DELTA', currentFiles, files)

    // skip delta calculations
    if (Object.keys(currentFiles).length === 0) {
      System.instance().pushFileDelta(files, [])
    }

    console.log('SYSTEM FILES ARE NOW', System.instance().files)

  }, 500), [])

  useEffect(() => {
    processFileDelta(files)
  }, [files])

  //const [io, setIO] = useRecoilValue(withSystemIO)

  // const processIODelta = useCallback(debounce((io: { [key: string]: types.IO; }) => {

  //   const currentFiles = System.instance().files
  //   console.log('PUSHING SYSTEM FILE DELTA', currentFiles, files)

  //   // skip delta calculations
  //   if (currentFiles === {}) {
  //     System.instance().pushFileDelta(files, [])
  //   }

  // }, 500), [])

  // useEffect(() => {
  //   processFileDelta(files)
  // }, [io])



  // useEffect(() => {
  //   if (!isCanvasInitialized) return
  //   Project.instance().updateDefaultParams(defaultParamState)
  // }, [defaultParamState, isCanvasInitialized])

  // /**
  //  * Update project uniforms as recoil uniform value change
  //  */
  // useEffect(() => {
  //   if (!isCanvasInitialized) return
  //   Project.instance().updateParams(paramState, logger)
  //   if (projectRunStatus.frameNum > 0 && !projectRunStatus.running)
  //     Project.instance().renderFrame()
  // }, [paramState, isCanvasInitialized])

  /**
   * Update projcet shaders as recoil shader values change
   */
  // useEffect(() => {
  //   Project.instance().updateShaders(files, logger)
  //   //processFileChanges(files)
  // }, [files])

  /**
   * Anytime the working project changes, reset project running state
   */
  useEffect(() => {
    return () => {
      _smStop()
      cancelAnimationFrame(intervalHandle.current)
      setClearConsole()
      stop()
    }
  }, [projectID])

  /**
   * On site load, attach error handler for device
   */
  // useEffect(() => {

  //   const errorHandler = (ev: GPUUncapturedErrorEvent) => {
  //     let error = ev.error
  //     if (error instanceof GPUOutOfMemoryError) {
  //       logger.fatal('GPU', 'Out of memory')
  //       return
  //     }
  //     let message: string = error.message
  //     // shader error
  //     if (message.startsWith('Tint WGSL reader failure')) {

  //       let start = message.indexOf(':') + 1
  //       let body = message.substr(start, message.indexOf('Shader') - start).trim()
  //       logger.err("Shader error", body)
  //     }
  //     else if (message.startsWith('[ShaderModule] is an error.')) {
  //       logger.err("Shader module", message)
  //     }
  //     else {
  //       logger.err("Unknown error", message)
  //     }
  //     stop()
  //   }

  //   if (GPU.isInitialized())
  //     GPU.device.onuncapturederror = errorHandler
  // }, [logger, stop])
}

const useProjectStateMachine = () => {
  const setProjectRunStatus = useSetRecoilState(projectRunStatusAtom)

  const _smPause = useCallback(() => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: false,
        prevDuration: old.runDuration
      }
    })
  }, [setProjectRunStatus])

  const _smPlay = useCallback(() => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: true,
        lastStartTime: performance.now(),
      }
    })
  }, [setProjectRunStatus])

  const _smStop = useCallback(() => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: false,
        frameNum: 0,
        runDuration: 0,
        prevDuration: 0,
      }
    })
  }, [setProjectRunStatus])

  const _smStep = useCallback(() => {
    setProjectRunStatus(old => {
      let now = performance.now()
      return {
        ...old,
        runDuration: (now - old.lastStartTime) / 1000 + old.prevDuration,
        lastFrameRendered: now,
        dt: now - old.lastFrameRendered,
        frameNum: old.frameNum + 1
      }
    })
  }, [setProjectRunStatus])

  useEffect(() => {
    return () => _smStop()
  }, [_smStop])

  return { _smPlay, _smPause, _smStop, _smStep }
}

export default useProjectManager
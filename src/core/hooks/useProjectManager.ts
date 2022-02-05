/* eslint-disable import/no-anonymous-default-export */
import GPU from "core/system/gpu"
import { Project } from "@core/system/project"
import { ProjectControl, projectRunStatusAtom } from "core/recoil/atoms/controls"
import { canvasInitializedAtom, currentProjectIdAtom, projectShaderErrorsAtom, projectShadersAtom, withDefaultParams, withUserParams } from "core/recoil/atoms/project"
import { useCallback, useEffect, useRef } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useClearConsole } from "../../core/hooks/useConsole"
import useLogger from "./useLogger"
import useProjectControls from "./useProjectControls"

const useProjectManager = () => {

  const projectID = useRecoilValue(currentProjectIdAtom)
  const projectRunStatus = useRecoilValue(projectRunStatusAtom)

  const isCanvasInitialized = useRecoilValue(canvasInitializedAtom)
  const setFileError = useSetRecoilState(projectShaderErrorsAtom)

  const { controlStatus, play, pause, stop } = useProjectControls()
  const { _smPlay, _smPause, _smStop, _smStep } = useProjectStateMachine()

  const defaultParamState = useRecoilValue(withDefaultParams)

  const paramState = useRecoilValue(withUserParams)
  const files = useRecoilValue(projectShadersAtom)

  const setClearConsole = useClearConsole()

  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  /**
   * Handle play/pause/stop signals from the viewport panel
   */
  useEffect(() => {

    const renderStep = () => {
      if (isRunning.current) {
        _smStep()
        Project.instance().renderFrame()
        intervalHandle.current = window.requestAnimationFrame(renderStep)
      }
    }

    const onControlChange = async () => {
      if (controlStatus == ProjectControl.PLAY) {
        _smPlay()
        isRunning.current = true
        if (await Project.instance().prepareRun(projectRunStatus, logger, setFileError))
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

  /**
   * Update default param states as recoil default params change
   */
  useEffect(() => {
    if (projectRunStatus.frameNum > 0 && !projectRunStatus.running) {
      Project.instance().renderFrame()
    }
  }, [defaultParamState])

  /**
   * Update project uniforms as recoil uniform value change
   */
  useEffect(() => {
    Project.instance().updateParams(paramState, logger)
    if (projectRunStatus.frameNum > 0 && !projectRunStatus.running && isCanvasInitialized)
      Project.instance().renderFrame()
  }, [paramState, isCanvasInitialized])

  /**
   * Update projcet shaders as recoil shader values change
   */
  useEffect(() => {
    Project.instance().updateShaders(files, logger)
  }, [files])

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
  useEffect(() => {

    const errorHandler = (ev: GPUUncapturedErrorEvent) => {
      let error = ev.error
      if (error instanceof GPUOutOfMemoryError) {
        logger.fatal('GPU', 'Out of memory')
        return
      }
      let message: string = error.message
      // shader error
      if (message.startsWith('Tint WGSL reader failure')) {

        let start = message.indexOf(':') + 1
        let body = message.substr(start, message.indexOf('Shader') - start).trim()
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

    if (GPU.isInitialized())
      GPU.device.onuncapturederror = errorHandler
  }, [logger, stop])
}

const useProjectStateMachine = () => {
  const setProjectRunStatus = useSetRecoilState(projectRunStatusAtom)
  const defaultParamState = useRecoilValue(withDefaultParams)

  useEffect(() => {
    Project.instance().updateDefaultParams(defaultParamState)
  }, [defaultParamState])

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
/* eslint-disable import/no-anonymous-default-export */
import GPU from "@gpu/gpu"
import { Project } from "@gpu/project"
import { projectControlAtom, projectRunStatusAtom } from "@recoil/controls"
import { canvasInitializedAtom, currentProjectIDAtom, projectParamsAtom, projectShaderErrorsAtom, projectShadersAtom, withDefaultParams, withUserParams } from "@recoil/project"
import { useEffect, useRef } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { useClearConsole } from "./useConsole"
import useLogger from "./useLogger"
import useProjectLifecycle from "./useProjectLifecycle"

export default () => {

  const projectID = useRecoilValue(currentProjectIDAtom)
  const projectRunStatus = useRecoilValue(projectRunStatusAtom)
  const [projectControlStatus, setProjectControlStatus] = useRecoilState(projectControlAtom)
  const isCanvasInitialized = useRecoilValue(canvasInitializedAtom)
  const setFileError = useSetRecoilState(projectShaderErrorsAtom)
  const { play, pause, stop, step } = useProjectLifecycle()

  const defaultParamState = useRecoilValue(withDefaultParams)

  const paramState = useRecoilValue(withUserParams)
  const files = useRecoilValue(projectShadersAtom)

  const setClearConsole = useClearConsole()
  const setProjectControls = useSetRecoilState(projectControlAtom)

  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  /**
   * Handle play/pause/stop signals from the viewport panel
   */
  useEffect(() => {

    const renderStep = () => {
      if (isRunning.current) {
        step()
        Project.instance().renderFrame()
        intervalHandle.current = window.requestAnimationFrame(renderStep)
      }
    }

    const onControlChange = async () => {
      if (projectControlStatus == 'play') {
        play()
        isRunning.current = true
        if (await Project.instance().prepareRun(projectRunStatus, logger, setFileError))
          window.requestAnimationFrame(renderStep)
        else {
          setProjectControlStatus('stop')
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
    }
    onControlChange()
  }, [projectControlStatus])

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
      stop()
      cancelAnimationFrame(intervalHandle.current)
      setClearConsole()
      setProjectControls('stop')
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


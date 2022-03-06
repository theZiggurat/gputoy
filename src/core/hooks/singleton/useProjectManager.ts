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
import { debounce, isEqual, union, without } from "lodash"
import * as types from "@core/types"
import System from "@core/system"
import { withProjectIO } from "@core/recoil/atoms/io"
import { intersection } from "lodash"




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

  const ioChannels = useRecoilValue(withProjectIO)

  const type = types.NAGA_BUILTIN_VARIANTS[12]

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



  // TODO find better solution than brute forcing diff
  // very unoptimized, but heavily debounced so this is low priority for now
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


  // TODO find better solution than brute forcing diff
  // very unoptimized, but it shouldn't run much at all. basically only on
  // a component mount/unmount should this be called
  const processIODelta = useCallback((currentChannels: Record<string, types.IOChannel>) => {
    const prevChannels = System.instance().availChannels
    console.log('PUSHING SYSTEM IO DELTA', currentChannels)

    let prevKeys = Object.keys(prevChannels)

    // skip delta calculations
    if (prevKeys.length === 0) {
      System.instance().pushIoDelta(currentChannels, [])
      return
    }

    // feed availible io by diff for more advanced rebuild strategies down the line
    let currentKeys = Object.keys(currentChannels)
    let diff: Record<string, types.IOChannel> = {}
    let removed: string[] = []
    for (const channelKey of union(prevKeys, currentKeys)) {
      const prevIOChannel = prevChannels[channelKey]
      const currentIOChannel = currentChannels[channelKey]

      if (prevIOChannel && currentIOChannel) {
        if (!isEqual(prevIOChannel, currentIOChannel)) {
          diff[channelKey] = currentIOChannel
        }
      } else if (prevIOChannel && !currentIOChannel) {
        removed.push(channelKey)
      } else if (!prevIOChannel && currentIOChannel) {
        diff[channelKey] = currentIOChannel
      }
    }

    System.instance().pushIoDelta(diff, removed)

    console.log('SYSTEM IO IS NOW', System.instance().availChannels)
  }, [])

  useEffect(() => {
    processIODelta(ioChannels)
  }, [ioChannels])



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
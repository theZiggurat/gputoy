import { useCallback, useEffect, useRef } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

import useLogger from "../useLogger"
import useProjectControls from "../useProjectControls"
import { useClearConsole } from "@core/hooks/useConsole"
import { ProjectControl } from "@core/recoil/atoms/controls"
import {
  currentProjectIdAtom
} from "@core/recoil/atoms/project"
import { withProjectFilesJSON } from "@core/recoil/atoms/files"
import { debounce, isEqual, union, uniq } from "lodash"
import * as types from "@core/types"
import System from "@core/system"
import { withProjectIO } from "@core/recoil/atoms/io"
import { systemBuildStateAtom, systemFrameStateAtom, systemValidationStateAtom, withSystemPrebuildResult } from "@core/recoil/atoms/system"



/**
 * Glue between the recoil/react world and System singleton class
 * Most dataflow is unidirectional from recoil world to System, but
 * System is also capable of writing to select atoms for build, 
 * validation, and resource info. 
 */
const useProjectManager = () => {

  const projectID = useRecoilValue(currentProjectIdAtom)

  const { controlStatus, play, pause, stop } = useProjectControls()
  const { _smPlay, _smPause, _smStop, _smStep } = _useSystemFrameState()

  const files = useRecoilValue(withProjectFilesJSON)

  const setClearConsole = useClearConsole()

  const logger = useLogger()

  const isRunning = useRef(false)
  const intervalHandle = useRef(0)

  const ioChannels = useRecoilValue(withProjectIO)

  const [validationState, setValidationState] = useRecoilState(systemValidationStateAtom)
  const [buildState, setBuildState] = useRecoilState(systemBuildStateAtom)
  const setPrebuildResult = useSetRecoilState(withSystemPrebuildResult)

  const renderStep = useCallback((timestamp: DOMHighResTimeStamp) => {
    if (isRunning.current) {
      intervalHandle.current = requestAnimationFrame(renderStep)
      _smStep(timestamp)
    }
  }, [])

  /**
   * Handle play/pause/stop signals from the viewport panel
   */
  useEffect(() => {

    const onControlChange = async () => {
      if (controlStatus == ProjectControl.PLAY) {
        _smPlay(performance.now())
        isRunning.current = true

        /**
         * TODO: figure out why this is a long task
         */
        setValidationState('validating')
        let preres = await System.instance().prebuild(logger)
        if (!preres) {
          setValidationState('failed')
          if (buildState === 'built') {
            requestAnimationFrame(renderStep)
            return () => cancelAnimationFrame(intervalHandle.current)
          }
          return
        }
        setPrebuildResult(preres)
        setValidationState('validated')
        setBuildState('building')
        let result = await System.instance().build(logger)
        if (result) {
          setBuildState('built')
          requestAnimationFrame(renderStep)
          return () => cancelAnimationFrame(intervalHandle.current)
        }
        setBuildState('failed')
        stop()

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
  const processFileDelta = useCallback(debounce(async (files: { [key: string]: types.File; }) => {

    const prev = System.instance().files
    const prevFiles = Object.keys(prev)

    // skip delta calculations
    if (Object.keys(prevFiles).length === 0) {
      System.instance().pushFileDelta(files, [])
    }

    // feed availible io by diff for more advanced rebuild strategies down the line
    let currentFiles = Object.keys(files)
    let diff: Record<string, types.File> = {}
    let removed: string[] = []
    for (const fileId of union(prevFiles, currentFiles)) {
      const prevFile = prev[fileId]
      const currentFile = files[fileId]

      if (prevFile && currentFile) {
        if (!isEqual(prevFile, currentFile)) {
          diff[fileId] = currentFile
        }
      } else if (prevFile && !currentFile) {
        removed.push(fileId)
      } else if (!prevFile && currentFile) {
        diff[fileId] = currentFile
      }
    }

    System.instance().pushFileDelta(diff, removed, logger)

  }, 500), [])

  useEffect(() => {
    processFileDelta(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])


  // TODO find better solution than brute forcing diff
  // very unoptimized, but it shouldn't run much at all. basically only on
  // a component mount/unmount should this be called
  const processIODelta = useCallback(async (currentChannels: Record<string, types.IOChannel>) => {
    const prevChannels = System.instance().availChannels

    let prevKeys = Object.keys(prevChannels)

    // skip delta calculations
    if (prevKeys.length === 0) {
      System.instance().pushIoDelta(currentChannels, [], [], logger)
      return
    }

    // feed availible io by diff for more advanced rebuild strategies down the line
    let currentKeys = Object.keys(currentChannels)
    let diff: Record<string, types.IOChannel> = {}
    let removed: string[] = []
    let updated: string[] = []
    for (const channelKey of uniq([...prevKeys, ...currentKeys])) {
      const prevIOChannel = prevChannels[channelKey]
      const currentIOChannel = currentChannels[channelKey]

      if (prevIOChannel && currentIOChannel) {
        if (!isEqual(prevIOChannel, currentIOChannel)) {
          diff[channelKey] = currentIOChannel
        } else {
          updated.push(channelKey)
        }
      } else if (prevIOChannel && !currentIOChannel) {
        removed.push(channelKey)
      } else if (!prevIOChannel && currentIOChannel) {
        diff[channelKey] = currentIOChannel
      }
    }

    System.instance().pushIoDelta(diff, updated, removed, logger)

    // re-build on file change
    // TODO: debounce this or find a more sensible rebuild solution
    setBuildState('building')
    let preres = await System.instance().build(logger)
    setBuildState(preres ? 'built' : 'failed')


  }, [])

  useEffect(() => {
    processIODelta(ioChannels)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ioChannels])


  // Anytime the working project changes, reset project running state
  useEffect(() => {
    return () => {
      _smStop()
      cancelAnimationFrame(intervalHandle.current)
      setClearConsole()
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID])


  const onKeyDown = useCallback(async (ev: KeyboardEvent) => {
    // save validates the current files
    if (ev.key == 's' && ev.ctrlKey) {
      ev.preventDefault()

      _smPause()
      pause()
      setBuildState('unbuilt')

      await processFileDelta.flush()
      setValidationState('validating')
      let preresult = await System.instance().prebuild(logger)
      setValidationState(preresult ? 'validated' : 'failed')
      preresult && setPrebuildResult(preresult)

      setBuildState('building')
      let result = await System.instance().build(logger)
      setBuildState(result ? 'built' : 'failed')

      if (result) {
        const timestamp = performance.now()
        _smPlay(timestamp)
        play()
        requestAnimationFrame(renderStep)
      }
    }
  }, [processFileDelta])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

}


/**
 * 
 * Time dependent state machine for tracking system run times. 
 * @returns controls for state machine
 */
const _useSystemFrameState = () => {
  const setFrameState = useSetRecoilState(systemFrameStateAtom)

  const _smPause = useCallback(() => {
    setFrameState(old => {
      return {
        ...old,
        running: false,
        prevDuration: old.runDuration
      }
    })
  }, [setFrameState])

  const _smPlay = useCallback((timestamp: DOMHighResTimeStamp) => {
    setFrameState(old => {
      return {
        ...old,
        running: true,
        lastStartTime: timestamp,
      }
    })
  }, [setFrameState])

  const _smStop = useCallback(() => {
    setFrameState(old => {
      return {
        ...old,
        running: false,
        frameNum: 0,
        runDuration: 0,
        prevDuration: 0,
      }
    })
  }, [setFrameState])

  const _smStep = useCallback((timestamp: DOMHighResTimeStamp) => {
    setFrameState(old => {
      System.instance().dispatch(old)
      return {
        ...old,
        runDuration: (timestamp - old.lastStartTime) / 1000 + old.prevDuration,
        lastFrameRendered: timestamp,
        dt: timestamp - old.lastFrameRendered,
        frameNum: old.frameNum + 1
      }
    })
  }, [setFrameState])

  useEffect(() => {
    return () => _smStop()
  }, [_smStop])

  return { _smPlay, _smPause, _smStop, _smStep }
}

export default useProjectManager
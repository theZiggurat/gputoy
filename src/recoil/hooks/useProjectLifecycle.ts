/* eslint-disable import/no-anonymous-default-export */
import { Project } from "@gpu/project"
import { projectRunStatusAtom } from "@recoil/controls"
import { withDefaultParams } from "@recoil/project"
import { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"

export default () => {
  const setProjectRunStatus = useSetRecoilState(projectRunStatusAtom)
  const defaultParamState = useRecoilValue(withDefaultParams)

  useEffect(() => {
    Project.instance().updateDefaultParams(defaultParamState)
  }, [defaultParamState])

  useEffect(() => {
    return () => stop()
  }, [])

  const pause = () => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: false,
        prevDuration: old.runDuration
      }
    })
  }

  const play = () => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: true,
        lastStartTime: performance.now(),
      }
    })
  }

  const stop = () => {
    setProjectRunStatus(old => {
      return {
        ...old,
        running: false,
        frameNum: 0,
        runDuration: 0,
        prevDuration: 0,
      }
    })
  }

  const step = () => {
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
  }

  return { play, pause, stop, step }
}
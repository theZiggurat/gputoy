import { CreatePageProjectQueryWithId } from "core/types/queries"
import ProjectDirect from "@gpu/projectDirect"
import { projectStatusDefault } from "core/recoil/atoms/controls"
import { Dispatch, SetStateAction, useRef, useState, useEffect, MutableRefObject } from "react"
import { useRecoilValue } from "recoil"
import { gpuStatusAtom } from "../../core/recoil/atoms/gpu"

const useProjectDirect = (
  project: CreatePageProjectQueryWithId,
  autoplay: boolean,
  ...canvasIDs: string[]
): [boolean, Dispatch<SetStateAction<boolean>>] => {

  const projectRef = useRef<ProjectDirect | undefined>(undefined)
  const controls = useProjectLifecycleDirect(projectRef)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const animationHandle = useRef(0)
  const playingRef = useRef(false)
  const gpuStatusValue = useRecoilValue(gpuStatusAtom)

  useEffect(() => {
    const init = async () => {
      projectRef.current = new ProjectDirect()
      await projectRef.current.init(project, ...canvasIDs)
      setLoading(false)
    }
    if (gpuStatusValue == 'ok')
      init()
    return () => {
      cancelAnimationFrame(animationHandle.current)
    }
  }, [gpuStatusValue])

  useEffect(() => {
    if (autoplay)
      setPlaying(true)
  }, [])

  const render = () => {
    if (!playingRef.current) return
    controls.step()
    projectRef.current?.renderFrame()
    animationHandle.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    playingRef.current = playing
    if (!loading) {
      if (playing || autoplay) {
        controls.play()
        animationHandle.current = requestAnimationFrame(render)
      } else {
        controls.pause()
      }
    }
    return () => cancelAnimationFrame(animationHandle.current)
  }, [playing, loading])

  return [loading, setPlaying]
}

export default useProjectDirect

const useProjectLifecycleDirect = (project: MutableRefObject<ProjectDirect | undefined>) => {
  const [projectStatus, setProjectStatus] = useState(projectStatusDefault)

  const pause = () => {
    setProjectStatus(old => {
      return {
        ...old,
        running: false,
        prevDuration: old.runDuration
      }
    })
  }

  const play = () => {
    setProjectStatus(old => {
      return {
        ...old,
        running: true,
        lastStartTime: performance.now(),
      }
    })
  }

  const stop = () => {
    setProjectStatus(old => {
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
  }

  useEffect(() => {
    project.current?.updateDefaultParams([
      { paramName: 'time', paramType: 'float', param: [projectStatus.runDuration] },
      { paramName: 'dt', paramType: 'float', param: [projectStatus.dt] },
      { paramName: 'frame', paramType: 'int', param: [projectStatus.frameNum] },
      { paramName: 'mouseNorm', paramType: 'vec2f', param: [0.5, 0.5] },
      { paramName: 'aspectRatio', paramType: 'float', param: [1] },
      { paramName: 'res', paramType: 'vec2i', param: [300, 300] },
      { paramName: 'mouse', paramType: 'vec2i', param: [150, 150] },
    ])
  }, [projectStatus])

  return { play, pause, stop, step }
}
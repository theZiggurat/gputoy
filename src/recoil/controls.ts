import { MutableRefObject, useEffect, useState } from 'react'
import ProjectDirect from '../gpu/projectDirect'

const projectStatusDefault = {
  lastStartTime:  0,
  lastFrameRendered:  0,
  dt: 0,
  frameNum: 0,
  runDuration:  0,
  prevDuration: 0,
  running: false,
}

export const useProjectControlsDirect = (project: MutableRefObject<ProjectDirect | undefined>) => {
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
      }})
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
      {paramName: 'time', paramType: 'float', param: [projectStatus.runDuration]},
      {paramName: 'dt',   paramType: 'float', param: [projectStatus.dt]},
      {paramName: 'frame', paramType: 'int', param: [projectStatus.frameNum]},
      {paramName: 'mouseNorm', paramType: 'vec2f', param: [0.5, 0.5]},
      {paramName: 'aspectRatio', paramType: 'float', param: [1]},
      {paramName: 'res', paramType: 'vec2i', param: [300, 300]},
      {paramName: 'mouse', paramType: 'vec2i', param: [150, 150]},
    ])
  }, [projectStatus])

  return { play, pause, stop, step }
}
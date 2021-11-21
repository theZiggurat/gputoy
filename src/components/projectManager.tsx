import React, { useLayoutEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { projectStatus } from '../recoil/project'


const ProjectManager = () => {

  const [projectStatusState, setProjectStatus] = useRecoilState(projectStatus)
  const [isRunningState, setRunningState] = useState(false)

  const isRunning = useRef(false)

  const intervalHandle = useRef(0)

  const f = () => {
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


  useLayoutEffect(() => {
    if (isRunning.current)
      window.requestAnimationFrame(f)
    return () => cancelAnimationFrame(intervalHandle.current)
  }, [isRunningState])

  // syncs the isRunning ref with recoil global projectStatus state
  // and triggers above layhout effect to run on switching projectStatus.running false -> true
  useLayoutEffect(() => {
    if (isRunning.current != projectStatusState.running) {
      isRunning.current = projectStatusState.running
    }
    setRunningState(projectStatusState.running)
    
  }, [projectStatusState])

  return <></>
}

export default ProjectManager
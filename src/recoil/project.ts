import  { atom, atomFamily, DefaultValue, selector, selectorFamily, useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil'
import * as types from '../gpu/types'

// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'

import { layoutState } from './layout'
import { _console } from './console'
import { useEffect } from 'react'
import { Project } from '../gpu/project'


export const projectStatus = atom<types.ProjectStatus>({
  key: 'projectStatus',
  default: {
    lastStartTime:  0,
    lastFrameRendered:  0,
    dt: 0,
    frameNum: 0,
    runDuration:  0,
    prevDuration: 0,
    running: false,
  } 
})


export type FileErrors = {
  [key: string]: number
}
export const fileErrors = atom<FileErrors>({
  key: 'fileErrors',
  default: {},
})

export const mousePos = atom<types.MousePos>({
  key: 'mousepos',
  default: {
    x: 0,
    y: 0
  },
})

export const resolution = atom<types.Resolution>({
  key: 'resolution',
  default: {
    width: 0,
    height: 0,
  },
})

export const params = atomFamily<types.ParamDesc[], string>({
  key: 'params',
  default: [],
})

export const codeFiles = atomFamily<types.CodeFile[], string>({
  key: 'codefiles',
  default: [{file: defaultShader, filename: 'render', lang: 'wgsl', isRender: true}],
})

export const title = atomFamily<string, string>({
  key: 'projectTitle',
  default: ''
})

export const defaultParams = selector<types.ParamDesc[]>({
  key: 'defaultParams',
  get: ({get}) => {

    const mouse = get(mousePos)
    const res = get(resolution)
    const status = get(projectStatus)

    return [
      {paramName: 'time', paramType: 'float', param: [status.runDuration]},
      {paramName: 'dt',   paramType: 'float', param: [status.dt]},
      {paramName: 'frame', paramType: 'int', param: [status.frameNum]},
      {paramName: 'mouseNorm', paramType: 'vec2f', param: [mouse.x / res.width, mouse.y / res.height]},
      {paramName: 'aspectRatio', paramType: 'float', param: [res.width / res.height]},
      {paramName: 'res', paramType: 'vec2i', param: [res.width, res.height]},
      {paramName: 'mouse', paramType: 'vec2i', param: [mouse.x, mouse.y]},
    ]
  },
})

export const projectState = selectorFamily<types.Project, string>({
  key: 'project',
  get: (id) => ({get}) => {
    const projectTitle = get(title(id))
    const projectFiles = get(codeFiles(id))
    const projectParams = get(params(id))
    
    return {
      title: projectTitle,
      files: projectFiles,
      params: projectParams,
    }
  },
  set: (id) => ({set, reset}, proj) => {
    if (proj instanceof DefaultValue) {
      reset(title(id))
      reset(codeFiles(id))
      reset(params(id))
    } else {
      set(title(id), proj.title)
      set(codeFiles(id), proj.files)
      set(params(id), proj.params)
    }
  }
})

export const workingProjectID = atom<string>({
  key: 'projectID',
  default: ''
})

export const canvasInitialized = atom<boolean>({
  key: 'canvasInitialized',
  default: false
})

type ProjectControl = 'play' | 'pause' | 'stop'
export const projectControl = atom<ProjectControl>({
  key: 'projectControl',
  default: 'stop'
})

export const useProjectControls = () => {
  const setProjectStatus = useSetRecoilState(projectStatus)
  const defaultParamState = useRecoilValue(defaultParams)

  useEffect(() => {
    Project.instance().updateDefaultParams(defaultParamState)
  }, [defaultParamState])

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

  return { play, pause, stop, step }
}



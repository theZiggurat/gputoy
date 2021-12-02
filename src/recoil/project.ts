import  { atom, atomFamily, selector, useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import localStorageEffect, { consoleLogEffect, setSkipStorage } from './effects'
import * as types from '../gpu/types'

// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'

import { Project as DBProject } from '.prisma/client'
import { layoutState } from './atoms'
import { useConsole, _console } from './console'


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

type ProjectControl = 'play' | 'pause' | 'stop'
export const projectControl = atom<ProjectControl>({
  key: 'projectControl',
  default: 'stop'
})

export const useProjectControls = () => {
  const setProjectStatus = useSetRecoilState(projectStatus)

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


export const codeFiles = atom<types.CodeFile[]>({
  key: 'codefiles',
  default: [{file: defaultShader, filename: 'render', lang: 'wgsl', isRender: true}],
  effects_UNSTABLE: [
    localStorageEffect('files'),
    consoleLogEffect('files')
  ]
})

export type FileErrors = {
  [key: string]: number
}
export const fileErrors = atom<FileErrors>({
  key: 'fileErrors',
  default: {},
  effects_UNSTABLE: [consoleLogEffect('fileErrors')]
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

export const params = atom<types.ParamDesc[]>({
  key: 'params',
  default: [],
  effects_UNSTABLE: [
    localStorageEffect('params')
  ]
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

export const canvasInitialized = atom<boolean>({
  key: 'canvasInitialized',
  default: false
})

export const setProjectStateFromDBValue = (): (project: DBProject) => void => {

  setSkipStorage(true)

  useResetRecoilState(_console)()
  useResetRecoilState(resolution)()
  useResetRecoilState(mousePos)()
  useResetRecoilState(projectStatus)()

  const setShaders = useSetRecoilState(codeFiles)
  const setParams = useSetRecoilState(params)
  const setLayout = useSetRecoilState(layoutState)
  const resetLayout = useResetRecoilState(layoutState)

  const setTo = (project: DBProject) => {
    if (!project)
      return

    setShaders(project.shaders.map(s => {
      return {
        filename: s.name,
        file: s.source,
        lang: s.lang,
        isRender: s.isRender,
      }
    }))

    if (project.params)
      setParams(JSON.parse(project.params))
    else
      setParams([])

    if(project.layout)
      setLayout(project.layout)
    else
      resetLayout()
  }
  
  return setTo

}

export const setProjectStateFromLocalStorage = () => {

  const callback = () => {
    console.log('here', typeof window === 'undefined')
    if (typeof window === 'undefined') return
    useResetRecoilState(_console)()
    useResetRecoilState(resolution)()
    useResetRecoilState(mousePos)()
    useResetRecoilState(projectStatus)()
  
    const setShaders = useSetRecoilState(codeFiles)
    const setParams = useSetRecoilState(params)
    const setLayout = useSetRecoilState(layoutState)
  
  
    let shaders = window.localStorage.getItem('files')
    if (shaders)
      setShaders(JSON.parse(shaders))
    else
      useResetRecoilState(codeFiles)()
  
    let parameters = window.localStorage.getItem('params')
    if (parameters)
      setParams(JSON.parse(parameters))
    else
      useResetRecoilState(codeFiles)()
  
    let layout = window.localStorage.getItem('files')
    if (layout)
      setLayout(JSON.parse(layout))
    else
      useResetRecoilState(layoutState)()
  }
  
  callback()
}


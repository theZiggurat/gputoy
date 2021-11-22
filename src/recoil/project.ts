import  { atom, atomFamily, selector, useRecoilCallback } from 'recoil'
import { CodeFile } from '../components/panels/impls/editorPanel'
import { ParamDesc } from '../gpu/params'
import { Project } from '../gpu/project'
import localStorageEffect, { canvasSync, consoleLogEffect } from './effects'

type ProjectStatus = {
  lastStartTime: number
  lastFrameRendered: number
  dt: number
  frameNum: number
  runDuration: number
  prevDuration: number
  running: boolean
}

export const projectStatus = atom<ProjectStatus>({
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

export const params = atom<ParamDesc[]>({
  key: 'params',
  default: [],
  effects_UNSTABLE: [
    localStorageEffect('params')
  ]
})

export const codeFiles = atom<CodeFile[]>({
  key: 'codefiles',
  default: [],
  effects_UNSTABLE: [
    localStorageEffect('files')
  ]
})

type MousePos = {
  x: number,
  y: number
}

type Resolution = {
  width: number,
  height: number,
}

export const mousePos = atom<MousePos>({
  key: 'mousepos',
  default: {
    x: 0,
    y: 0
  },
})

export const resolution = atom<Resolution>({
  key: 'resolution',
  default: {
    width: 0,
    height: 0,
  },
})

export type CanvasStatus = {
  id: string,
  attached: boolean,
}

// const canvasSync = ({setSelf, onSet}) => {
//   onSet(async (newValue: CanvasStatus, oldValue: CanvasStatus, _: boolean) => {
//     //if (newValue.id !== oldValue.id) {
//       let success = await Project.instance().attachCanvas(newValue.id)
//       if (success)
//         //Console.log('Viewport', `id: ${newValue.id} attach success`)
//       else 
//         //Console.err('Viewport', `id: ${newValue.id} attach failed`)
//     //}
//   })
// }

// export const canvasStatus = atom<CanvasStatus>({
//   key: 'canvasStatus',
//   default: {
//     id: '',
//     attached: false
//   },
//   effects_UNSTABLE: [
//     canvasSync
//   ]
// })



export const defaultParams = selector<ParamDesc[]>({
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
  }
})


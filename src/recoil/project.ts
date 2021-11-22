import  { atom, atomFamily, selector, useRecoilCallback } from 'recoil'
import { CodeFile } from '../components/panels/impls/editorPanel'
import Console from './console'
import { ParamDesc } from '../gpu/params'
import { Project } from '../gpu/project'
import localStorageEffect, { canvasSync } from './localstorage'

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

export const mousePos = atom<MousePos>({
  key: 'mousepos',
  default: {
    x: 0,
    y: 0
  }
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

export const canvasStatus = atom<CanvasStatus>({
  key: 'canvasStatus',
  default: {
    id: '',
    attached: false
  },
  effects_UNSTABLE: [
    canvasSync
  ]
})



export const defaultParams = atom<ParamDesc[]>({
  key: 'defaultParams',
  default: [
    {paramName: 'time', paramType: 'float', param: [0]},
    {paramName: 'dt',   paramType: 'float', param: [0]},
    {paramName: 'mouseNorm', paramType: 'vec2f', param: [0, 0]},
    {paramName: 'aspectRatio', paramType: 'float', param: [0]},
    {paramName: 'res', paramType: 'vec2i', param: [0, 0]},
    {paramName: 'frame', paramType: 'int', param: [0]},
    {paramName: 'mouse', paramType: 'vec2i', param: [0, 0]},
  ]
})


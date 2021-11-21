import  { atom, atomFamily, selector, useRecoilCallback } from 'recoil'
import { CodeFile } from '../components/panels/impls/editorPanel'
import { ParamDesc } from '../gpu/params'
import localStorageEffect from './localstorage'

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
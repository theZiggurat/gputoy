import * as types from '@gpu/types'
import { atom } from 'recoil'

type ProjectControl = 'play' | 'pause' | 'stop'
export const projectControlAtom = atom<ProjectControl>({
  key: 'projectControl',
  default: 'stop'
})

export const projectStatusDefault = {
  lastStartTime: 0,
  lastFrameRendered: 0,
  dt: 0,
  frameNum: 0,
  runDuration: 0,
  prevDuration: 0,
  running: false,
}

export const projectRunStatusAtom = atom<types.ProjectStatus>({
  key: 'projectStatus',
  default: projectStatusDefault
})
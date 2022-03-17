import * as types from 'core/types'
import { atom } from 'recoil'

export enum ProjectControl {
  PLAY,
  PAUSE,
  STOP
}
export const projectControlAtom = atom<ProjectControl>({
  key: 'projectControl',
  default: ProjectControl.STOP
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
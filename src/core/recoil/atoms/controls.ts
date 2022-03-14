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

export enum ProjectBuildStatus {
  NOT_BUILT,
  BUILDING,
  SUCCESS,
  FAILED
}
export const projectBuildStatusAtom = atom<ProjectBuildStatus>({
  key: 'projectBuildStatus',
  default: ProjectBuildStatus.NOT_BUILT
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
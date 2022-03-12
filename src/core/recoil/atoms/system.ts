import * as types from '@core/types'
import { atom } from 'recoil'

export const systemValidationStateAtom = atom<types.SystemValidationState>({
  key: 'sys_buildstate',
  default: 'unvalidated'
})

export const systemBuildStateAtom = atom<types.SystemBuildState>({
  key: 'sys_buildstate',
  default: 'unbuilt'
})

export const systemFrameStateAtom = atom<types.SystemFrameState>({
  key: 'sys_framestate',
  default: types.defaultFrameState
})


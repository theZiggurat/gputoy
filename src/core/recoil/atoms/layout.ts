import { Task } from '@core/types'
import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { atom, atomFamily, DefaultValue, selector } from 'recoil'
import * as types from '@core/types'

export const layoutAtom = atom<any>({
  key: 'layout',
  default: {}
})

export const masterTaskAtom = atom<Task | undefined>({
  key: 'layoutTasksMaster',
  default: undefined
})

export const taskAtom = atomFamily<Task | undefined, string>({
  key: 'tasks',
  default: undefined
})

type TaskPush = {
  instanceId?: string,
  task?: Task
}
export const withTaskPusher = selector<TaskPush>({
  key: 'withTasks',
  get: ({ get }) => ({}),
  set: ({ set, reset }, taskPush) => {
    if (!(taskPush instanceof DefaultValue) && taskPush.instanceId && taskPush.task) {
      set(taskAtom(taskPush.instanceId), taskPush.task as Task)
    }
  }
})

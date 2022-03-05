import { Task } from '@core/types'
import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { atom, atomFamily, DefaultValue, selector } from 'recoil'
import * as types from '@core/types'

export const layoutAtom = atom<any>({
  key: 'layout',
  default: {
    "left": {
      "instanceID": "tuAJ12Kr",
      "index": 5,
      "type": "leaf"
    },
    right: {
      "left": {
        "left": {
          "instanceID": "-Tf2CZSB",
          "index": 1,
          "type": "leaf"
        },
        "right": {
          "instanceID": "_CWXFY_l",
          "index": 4,
          "type": "leaf"
        },
        "index": -1,
        "type": "horizontal",
        "instanceID": "eNI3H93P",
        "size": .65
      },
      "right": {
        "instanceID": "L0xhpauP",
        "index": 3,
        "type": "leaf"
      },
      "index": -1,
      "type": "vertical",
      "instanceID": "UjsW244-",
      "size": .65
    },
    "index": -1,
    "type": "vertical",
    "instanceID": "Li-dJ1e2",
    "size": 0.13
  },
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

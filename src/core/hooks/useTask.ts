import { Logger } from '@core/recoil/atoms/console'
import { instanceFocusFILOAtom, withFocusPriority } from '@core/recoil/atoms/instance'
import { layoutAtom, masterTaskAtom, taskAtom, withTaskPusher } from '@core/recoil/atoms/layout'
import * as types from '@core/types'
import { useCallback, useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

export const useTaskPusher = (instanceId: string) => {
  const setTasks = useSetRecoilState(masterTaskAtom)
  return (task: Partial<types.Task>) => setTasks({ ...task, sourceId: instanceId, message: task["message"] ?? "noop" })
}

export const useTaskReciever = (
  id: string,
  onTask: { [key: string]: (task: types.Task) => boolean }
) => {
  const task = useRecoilValue(taskAtom(id))

  useEffect(() => {
    if (task && task.message) {
      const taskFunc = onTask[task.message]
      if (typeof taskFunc === 'function')
        taskFunc(task)
    }
  }, [task])
}

export const useTaskCoordinator = (
  logger?: Logger,
) => {
  const task = useRecoilValue(masterTaskAtom)
  const push = useSetRecoilState(withTaskPusher)
  const focusFIFO: types.InstanceSelector[] = useRecoilValue(instanceFocusFILOAtom)

  const locateTaskTarget = useCallback((task: types.Task) => {
    const { targetId, targetPanelIndex } = task
    logger?.debug('TASK', JSON.stringify(task, undefined, 2))
    if (targetId) {
      push({ instanceId: targetId, task })
    }
    else if (targetPanelIndex) {
      const sel = focusFIFO.find(({ index }) => index === targetPanelIndex)
      if (sel) {
        push({ instanceId: sel.id, task })
      } else {
        logger?.debug('TASK', `No avail recievers for index ${targetPanelIndex}`)
      }
    }
    else {

    }
  }, [push, focusFIFO, logger])

  useEffect(() => {
    if (task) {
      locateTaskTarget(task)
    }
  }, [task])
}

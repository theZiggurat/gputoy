import descriptors from "@components/panels/descriptors"
import {
  atom,
  atomFamily,
  DefaultValue,
  selector
} from "recoil"
import * as types from '@core/types'
import { layoutAtom } from "./layout"

/**
 *  holds state for panel instances by instance selector
 *  panels with their assigned instanceId will be able to access their instance-bound state
 *  accessed directly by use
 */
export const panelInstanceAtom = atomFamily<types.InstanceState, types.InstanceSelector>({
  key: 'instanceState',
  default: (selector: types.InstanceSelector) => {
    return selector.index !== undefined && selector.index >= 0 ?
      descriptors[selector.index].defaultInstanceProps
      : { split: 50 }
  },
  effects_UNSTABLE: sel => [
    // ({ trigger, onSet, getLoadable, getPromise }) => {
    //   onSet((newVal, oldVal) => {
    //     console.log('SET INSTANCE STATE', sel, newVal, oldVal)
    //   })
    // },
    // ({ trigger, onSet, getLoadable, getPromise }) => {
    //   onSet((newVal, oldVal) => {
    //     console.log('SET INSTANCE STATE', sel, newVal, oldVal)
    //   })
    // }
  ]
})

export const panelInstanceListAtom = atom<types.InstanceSelector[]>({
  key: 'instances',
  default: []
})

export const withEditorLayout = selector<types.EditorLayout>({
  key: 'withEditorLayout',
  get: ({ get }) => {
    let ret: types.EditorLayout = { layout: get(layoutAtom), instances: {} }
    const instanceList = get(panelInstanceListAtom)
    for (const selector of instanceList) {
      ret.instances[selector.id] = {
        ...get(panelInstanceAtom(selector)),
        index: (selector.index ?? -1) < 0 ? undefined : selector.index
      }
    }
    return ret
  },
  set: ({ set, reset }, state) => {
    let list: types.InstanceSelector[] = []
    if (state instanceof DefaultValue) return
    Object.entries(state.instances ?? {}).forEach(([id, instanceState]) => {
      let index = instanceState.index
      list.push({ id, index })
      set(panelInstanceAtom({ id, index }), instanceState)
    })
    set(panelInstanceListAtom, list)
    set(layoutAtom, state.layout)
  }
})

export const withInstanceCleaner = selector<types.InstanceSelector[]>({
  key: 'instanceStateCleaner',
  get: ({ get }) => get(panelInstanceListAtom),
  set: ({ set, reset }, instances) => {
    set(panelInstanceListAtom, prev => {
      const idArr = (instances as types.InstanceSelector[]).map(sel => sel.id)
      prev.filter(sel => !idArr.includes(sel.id)).forEach(sel =>
        reset(panelInstanceAtom(sel))
      )
      return instances
    })
  }
})

export const instanceFocusPriorityAtom = atom<types.InstanceSelector[]>({
  key: 'instanceFocusFILO',
  default: []
})

export const withFocusPriority = selector<types.InstanceSelector>({
  key: 'withFocusPriority',
  get: ({ get }) => ({} as types.InstanceSelector),
  set: ({ set, reset }, selector) => {
    if (!(selector instanceof DefaultValue)) {
      set(instanceFocusPriorityAtom, prev => {
        const newlist = [...prev]
        const prevIdx = prev.map(s => s.id).indexOf(selector.id)
        if (prevIdx >= 0) {
          for (let i = prevIdx; i > 0; i--) {
            newlist[i] = prev[i - 1]
          }
          newlist[0] = selector
          return newlist
        } else {
          const newlist = [selector, ...prev]
          newlist.length = Math.min(32, newlist.length)
          return newlist
        }
      })
    }
  }
})

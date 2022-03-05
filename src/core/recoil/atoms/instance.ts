import descriptors, { InstanceState } from "@components/panels/descriptors"
import {
  atom,
  atomFamily,
  DefaultValue,
  selector
} from "recoil"
import * as types from '@core/types'

/**
 *  holds state for panel instances by instance selector
 *  panels with their assigned instanceId will be able to access their instance-bound state
 *  accessed directly by use
 */
export const panelInstanceAtom = atomFamily<InstanceState, types.InstanceSelector>({
  key: 'instanceState',
  default: (selector: types.InstanceSelector) => {
    return selector.index !== undefined && selector.index >= 0 ?
      descriptors[selector.index].defaultInstanceProps
      : { split: 50 }
  },
})

export const panelInstanceListAtom = atom<types.InstanceSelector[]>({
  key: 'instances',
  default: []
})

export const withInstanceStateJSON = selector<{ [key: string]: InstanceState }>({
  key: 'withInstanceState',
  get: ({ get }) => {
    let state = {}
    const instanceList = get(panelInstanceListAtom)
    for (const selector of instanceList) {
      state[selector.id] = get(panelInstanceAtom(selector))
    }
    return state
  },
  set: ({ set, reset }, state) => {
    let list: types.InstanceSelector[] = []
    Object.entries(state).forEach((id, instanceState) => {
      list.push({ id })
      set(panelInstanceAtom({ id }), instanceState)
    })
    set(panelInstanceListAtom, list)
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

export const instanceFocusFILOAtom = atom<types.InstanceSelector[]>({
  key: 'instanceFocusFILO',
  default: []
})

export const withFocusPriority = selector<types.InstanceSelector>({
  key: 'withFocusPriority',
  get: ({ get }) => ({} as types.InstanceSelector),
  set: ({ set, reset }, selector) => {
    if (!(selector instanceof DefaultValue)) {
      set(instanceFocusFILOAtom, prev => {
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

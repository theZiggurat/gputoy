import descriptors, { InstanceState } from "@components/panels/descriptors"
import {
  atom,
  atomFamily,
  selector
} from "recoil"
import localStorageEffect from "../localStorageEffect"

type InstanceSelector = {
  id: string,
  index?: number
}

export const panelInstanceAtom = atomFamily<InstanceState, InstanceSelector>({
  key: 'instanceState',
  default: (selector: InstanceSelector) => {
    return selector.index !== undefined && selector.index >= 0 ?
      descriptors[selector.index].defaultInstanceProps
      : { split: 50 }
  },
  effects_UNSTABLE: (selector: InstanceSelector) => {
    return [
      localStorageEffect(`instance_${selector.id}_${selector.index}`)
    ]
  }
})

export const panelInstanceListAtom = atom<InstanceSelector[]>({
  key: 'instances',
  default: []
})

export const withInstanceCleaner = selector<InstanceSelector[]>({
  key: 'instanceStateCleaner',
  get: ({ get }) => get(panelInstanceListAtom),
  set: ({ set, reset }, instances) => {
    set(panelInstanceListAtom, prev => {
      const idArr = (instances as InstanceSelector[]).map(sel => sel.id)
      prev.filter(sel => !idArr.includes(sel.id)).forEach(sel =>
        reset(panelInstanceAtom(sel))
      )
      return instances
    })
  }
})

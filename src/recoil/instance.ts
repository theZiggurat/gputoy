import { memoize } from "lodash"
import { atom, atomFamily, DefaultValue, Resetter, selector, selectorFamily, SetterOrUpdater, useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil"
import localStorageEffect from "./effects"

export interface ConsoleInstanceState {
  typeFilters: boolean[]
  keywordFilter: string
}

export interface EditorInstanceState {
  currentFileIndex: number
}

export interface ParamInstanceState {
  keywordFilter: string,
  nameErrors: boolean[]
}

const defaultDynProps = [
  {

  },
  {
    keywordFilter: '',
    nameErrors: []
  },
  {
    currentFileIndex: -1
  }, 
  {
    keywordFilter: '',
    typeFilters: [true, true, true, true, false]
  }
]

type InstanceState = any
type InstanceSelector = {
  id: string,
  index?: number
}

const panelInstance = atomFamily<InstanceState, InstanceSelector>({
  key: 'instanceState',
  default: (selector: InstanceSelector) => {
    return selector.index !== undefined ? 
      defaultDynProps[selector.index]
      : { split: 50 }
  },
  effects_UNSTABLE: (selector: InstanceSelector) => {
    return [
      localStorageEffect(`instance_${selector.id}_${selector.index}`)
    ]
  }
})

const panelInstances = atom<InstanceSelector[]>({
  key: 'instances',
  default: []
})

const panelInstanceCleaner = selector<InstanceSelector[]>({
  key: 'instanceStateCleaner',
  get: ({get}) => get(panelInstances),
  set: ({set, reset}, instances) => {
    set(panelInstances, prev => {
      const idArr = instances.map(sel => sel.id)
      prev.filter(sel => !idArr.includes(sel.id)).forEach(sel =>
        reset(panelInstance(sel))
      )
      return instances
    })
  }
})

export const useInstances = () => {
  return useRecoilValue(panelInstances)
}

export const useInstanceCleaner = () => {
  return useSetRecoilState(panelInstanceCleaner)
}

const useInstance = <T>(props: any): [T, SetterOrUpdater<T>] => {
  return useRecoilState<T>(panelInstance({id: props.instanceID, index: props.panelIndex}))
}

export default useInstance

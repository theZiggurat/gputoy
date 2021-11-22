import { memoize } from "lodash"
import { atom, atomFamily, DefaultValue, Resetter, selectorFamily, SetterOrUpdater, useRecoilState, useResetRecoilState } from "recoil"
import localStorageEffect from "./localstorage"

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
    typeFilters: [true, true, true, true]
  }
]

type InstanceState = any
type InstanceSelector = {
  id: string,
  index: number
}

const panelInstanceState = atomFamily<InstanceState, InstanceSelector>({
  key: 'instanceState',
  default: (selector: InstanceSelector) => defaultDynProps[selector.index],
  effects_UNSTABLE: (selector: InstanceSelector) => {
    return [
      localStorageEffect(`instance_${selector.id}_${selector.index}`)
    ]
  }
})

export const panelInstances = atom<InstanceSelector[]>({
  key: 'instances',
  default: []
})

const panelInstanceStateSelector = selectorFamily({
  key: 'instanceStateSelector',

  get: (selector: InstanceSelector) => ({get}): InstanceState =>  {
    const instance = get(panelInstanceState(selector))
    return instance
  },

  set: (selector: InstanceSelector) => ({set, reset}, instance) => {

    // if it is a default value, the instance has been cleared
    if (guardRecoilDefaultValue(instance)) {
      reset(panelInstanceState(selector))
      set(panelInstances, prev => prev.filter(sel => sel.id != selector.id))
      return
    }

    // else, it has been set to something
    set(panelInstanceState(selector), instance)

    // if it is not yet in the instances list, add it
    set(panelInstances, prev => {
      if(!prev.map(sel => sel.id).includes(selector.id))
        return [...prev, selector]
      else
        return prev
    })
  }
}) 

const useInstance = <T>(props: any): [T, SetterOrUpdater<T>] => {
  return useRecoilState<T>(panelInstanceStateSelector({id: props.instanceID, index: props.panelIndex}))
}

export const clearInstance = (props: any): Resetter => {
    return useResetRecoilState(panelInstanceStateSelector({id: props.instanceID, index: props.panelIndex}))
}

export const guardRecoilDefaultValue = (
  candidate: unknown
): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) return true;
  return false;
};

export default useInstance

import { 
  atom, 
  atomFamily, 
  selector, 
  SetterOrUpdater, 
  useRecoilState,
  useRecoilValue, 
  useSetRecoilState 
} from "recoil"
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

  },
  {
    keywordFilter: '',
    nameErrors: []
  },
  {
    currentFileIndex: 0
  }, 
  {
    keywordFilter: '',
    typeFilters: [true, true, true, true, false]
  },
  {
    
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
      const idArr = (instances as InstanceSelector[]).map(sel => sel.id)
      prev.filter(sel => !idArr.includes(sel.id)).forEach(sel =>
        reset(panelInstance(sel))
      )
      return instances
    })
  }
})

/**
 * Setter for current panel instances
 * Used by panels component to garbage collect removed instances from local storage
 * @returns a setter 
 */
 export const useInstanceCleaner = () => {
  return useSetRecoilState(panelInstanceCleaner)
}

/**
 * Gives data about current panel instances
 * Used by panel bar so singleton panels cannot be chosen twice
 * @returns list of current panel instances
 */
export const useInstances = () => {
  return useRecoilValue(panelInstances)
}

/**
 * Returns panel instance state
 * to be used in panel implementations
 * @param props panelProps which includes {instanceID, index}
 * @returns instance state for panel
 */
const useInstance = <T>(props: any): [T, SetterOrUpdater<T>] => {
  return useRecoilState<T>(panelInstance({id: props.instanceID, index: props.panelIndex}))
}

export default useInstance

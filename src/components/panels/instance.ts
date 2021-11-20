import { memoize } from "lodash"
import { atom, SetterOrUpdater, useRecoilState } from "recoil"
import localStorageEffect from "../../recoil/localstorage"

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

export const panelInstanceState = memoize((id: number, index: number) => atom<InstanceState>({
  key: `instance${id}_${index}`,
  default: defaultDynProps[index],
  effects_UNSTABLE: [
    localStorageEffect(`instance${id}_${index}`)
  ]
}))

const useInstance = <T>(props: any): [T, SetterOrUpdater<T>] => {
  return useRecoilState<T>(panelInstanceState(props.instanceID, props.panelIndex))
}

export default useInstance

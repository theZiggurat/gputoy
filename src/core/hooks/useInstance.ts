import { panelInstanceAtom, panelInstanceListAtom, withInstanceCleaner } from "core/recoil/atoms/instance"
import { DefaultValue, SetterOrUpdater, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

/**
 * Setter for current panel instances
 * Used by panels component to garbage collect removed instances from local storage
 * @returns a setter 
 */
export const useInstanceCleaner = () => {
  return useSetRecoilState(withInstanceCleaner)
}

/**
 * Gives data about current panel instances
 * Used by panel bar so singleton panels cannot be chosen twice
 * @returns list of current panel instances
 */
export const useInstances = () => {
  return useRecoilValue(panelInstanceListAtom)
}

/**
 * Returns panel instance state
 * to be used in panel implementations
 * @param props panelProps which includes {instanceID, index}
 * @returns instance state for panel
 */
const useInstance = <T>(props: any): [T, SetterOrUpdater<T>] => {

  const [state, setState] = useRecoilState<T>(panelInstanceAtom({ id: props.instanceID, index: props.panelIndex }))
  return [state, setState]
}

export default useInstance
import {atom} from 'recoil'
import localStorageEffect from './effects'

export const layoutState = atom<any>({
  key: 'layout',
  default: {
    type: 'vertical',
    instanceID: 0,
    left: {
        type: 'horizontal',
        instanceID: 1,
        left: {
            type: 'leaf',
            instanceID: 2,
            index: 0
        },
        right: {
            type: 'leaf',
            instanceID: 3,
            index: 3
        }
    },
    right: {
        type: 'leaf',
        instanceID: 4,
        index: 2
    }
  },
  // for some reason I cant figure out
  // this local storage effect absolutely ruins the layout when rendering
  // even though the layout object it loads is identical to the one
  // loaded by the usePanels' useEffect
  // effects_UNSTABLE: [
  //   localStorageEffect('layout')
  // ]
})
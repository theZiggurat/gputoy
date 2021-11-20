import {atom} from 'recoil'
import localStorageEffect from './localstorage'

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
  // effects_UNSTABLE: [
  //   localStorageEffect('layout')
  // ]
})
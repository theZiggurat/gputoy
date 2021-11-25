import {atom} from 'recoil'
import localStorageEffect from './effects'

export const layoutState = atom<any>({
  key: 'layout',
  default: {
    "left": {
        "left": {
            "instanceID": "-Tf2CZSB",
            "index": 0,
            "type": "leaf"
        },
        "right": {
            "instanceID": "_CWXFY_l",
            "index": 3,
            "type": "leaf"
        },
        "index": -1,
        "type": "horizontal",
        "instanceID": "eNI3H93P"
    },
    "right": {
        "instanceID": "L0xhpauP",
        "index": 2,
        "type": "leaf"
    },
    "index": -1,
    "type": "vertical",
    "instanceID": "UjsW244-"
  }
  // for some reason I cant figure out
  // this local storage effect absolutely ruins the layout when rendering
  // even though the layout object it loads is identical to the one
  // loaded by the usePanels' useEffect
  // effects_UNSTABLE: [
  //   localStorageEffect('layout')
  // ]
})
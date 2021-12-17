import {atom} from 'recoil'
import { DefaultValue, useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { set } from 'lodash/fp'
import { debounce, get } from 'lodash'
import { nanoid } from 'nanoid'
import { MutableRefObject, ReactElement, useEffect, useState } from 'react'
import { useInstanceCleaner } from './instance'
import { layout } from '@chakra-ui/styled-system'

export const layoutState = atom<any>({
  key: 'layout',
  default: {
    "left": {
        "left": {
            "instanceID": "-Tf2CZSB",
            "index": 1,
            "type": "leaf"
        },
        "right": {
            "instanceID": "_CWXFY_l",
            "index": 4,
            "type": "leaf"
        },
        "index": -1,
        "type": "horizontal",
        "instanceID": "eNI3H93P",
				"size": .65
    },
    "right": {
        "instanceID": "L0xhpauP",
        "index": 3,
        "type": "leaf"
    },
    "index": -1,
    "type": "vertical",
    "instanceID": "UjsW244-",
		"size": .65
  },
  // effects_UNSTABLE: [
  //   ({setSelf, onSet}) => {
  //     setSelf(() => {
  //       if (typeof window === 'undefined') return new DefaultValue
  //       const layout = window.localStorage.getItem('layout')
  //       if (layout == null)
  //         return new DefaultValue
  //       else
  //         return JSON.parse(layout)
  //     })
  //     onSet((newValue, _, isReset) => {
  //       !isReset ? 
  //         window.localStorage.setItem('layout', JSON.stringify(newValue)): 
  //         window.localStorage.removeItem('layout')
  //     })
  //   }
  // ]
})


type Location = 'top' | 'bottom' | 'left' | 'right' 

export interface PanelProps {
  panelLayout: any,
  onSplitPanel: (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => void,
  onCombinePanel: (path: string) => void,
  onSwitchPanel: (path: string, panelIndex: number) => void,
  onPanelSizeChange: (path: string, newSize: number, totalSize: number) => void,
  addPanel: (panelIndex: number, location: Location) => void,
  resetPanels: () => void,
	layoutSize: number[],
	windowGen: number
}

export const usePanels = (initialLayout?: any): PanelProps => {

  const [panelTreeLayout, setPanelTreeLayout] = useRecoilState(layoutState)
  const resetPanelTreeLayout = useResetRecoilState(layoutState)

	const [layoutSize, setLayoutSize] = useState([0, 0])
	const [windowGen, setWindowGen] = useState(0)

  const cleaner = useInstanceCleaner()

	const handleWindowResize = debounce(() => {
		setLayoutSize([window.innerWidth, window.innerHeight - 45])
		setWindowGen(i => i+1)
	}, 50, {leading: true, trailing: true})
	useEffect(() => {
		window.addEventListener('resize', handleWindowResize)
		setLayoutSize([window.innerWidth, window.innerHeight - 45])
		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])

  // load layout from localstorage
  useEffect(() => {
		if(initialLayout !== undefined) return 
		const layout = window.localStorage.getItem('layout')
		trySetLayout(layout != null ? JSON.parse(layout): undefined)
  }, [])

  // save layout to local storage on change
  useEffect(debounce(() => {
		window.localStorage.setItem('layout', JSON.stringify(panelTreeLayout))
		cleaner(instances(panelTreeLayout))
  }, 1000), [panelTreeLayout])

  const trySetLayout = (layout: any | undefined) => { if(layout !== undefined) setPanelTreeLayout(layout) }
  const onSplit = (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => {
      trySetLayout(replaceAtPath(panelTreeLayout, path, layout => {
          const obj: any = {}
          obj['left'] = {instanceID: layout['instanceID'],index: layout['index'], type: 'leaf'}
          obj['right'] = {instanceID: genID(), index: panelIndex, type: 'leaf'}
          obj['index'] = -1
          obj['type'] = direction
          obj['instanceID']= genID()
          return obj
      }))
  }

  const onCombine= (path: string) => {
      const dir = path.charAt(path.length-1) === 'r' ? 'left':'right'
      trySetLayout(replaceAtPath(panelTreeLayout, path.substr(0, path.length-1), layout => {
          const obj: any = {}
          const child = layout[dir]
          obj['index'] = child['index']
          obj['instanceID'] = child['instanceID']
          obj['type'] = child['type']
          obj['left'] = child['left']
          obj['right'] = child['right']
					obj['size'] = child['size']
          return obj
      }))
  }

  const onSwitch = (path: string, panelIndex: number) => {
      if(get(panelTreeLayout, arrpath(path).concat('index')) === panelIndex) return
      trySetLayout(replaceAtPath(panelTreeLayout, path, layout => {
          const obj: any = {}
          obj['index'] = panelIndex
          obj['type'] = 'leaf'
          obj['instanceID'] = genID()
          return obj
      }))
  }

  const addPanel = (panelIndex: number, location: Location) => {
    trySetLayout(old => {
      const newPanel = {
        index: panelIndex,
        type: 'leaf',
        instanceID: nanoid(8),
      }
      const newLayout = {
        index: -1,
        type: location == 'top' || location == 'bottom' ? 'horizontal':'vertical',
        instanceID: nanoid(8),
        left: location == 'top' || location == 'left' ? newPanel : {...old},
        right: location == 'bottom' || location == 'right' ? newPanel : {...old},
				size: location == 'top' || location == 'left' ? 0.1:0.9,
      }
      return newLayout
    })
  }

  const onPanelSizeChange = debounce((path: string, newSize: number, totalSize: number) => {
    trySetLayout(replaceAtPath(panelTreeLayout, path, layout => {
      const obj: any = {...layout}
      obj['size'] = newSize / totalSize
      return obj
    }))
  }, 100)

  const resetPanels = resetPanelTreeLayout

  return {
      panelLayout: panelTreeLayout,
      onCombinePanel: onCombine,
      onSplitPanel: onSplit,
      onSwitchPanel: onSwitch,
      onPanelSizeChange,
      addPanel,
      resetPanels,
			layoutSize,
			windowGen
  }
}

const arrpath = (path: string): string[] => Array.from(path).map(c=>c==='l'?'left':'right')

const replaceAtPath = (obj: any, path: string, f: (obj: any) => void): any | undefined => {
    const apath = arrpath(path)
    const objAtPath = apath.length == 0 ? obj : get(obj, apath)
    if (objAtPath === undefined) 
        return false
    return apath.length == 0 ? f(objAtPath): set(apath, f(objAtPath), obj)
}

// const instances = (obj: any): any[] => {
//     return _instances(obj, '')
// }

const instances = (obj: any, path: string = ''): any[] => {
    const selfID = get(obj, arrpath(path).concat('instanceID'))
    const selfIndex = get(obj, arrpath(path).concat('index'))
    return selfID === undefined ? [] : [{id: selfID, index: selfIndex}]
      .concat(instances(obj, path.concat('l'))).concat(instances(obj, path.concat('r')))
}

const genID = () => nanoid(8)

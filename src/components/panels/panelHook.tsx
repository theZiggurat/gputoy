import { cloneDeep, debounce, set } from 'lodash/fp'
import React, { useEffect } from 'react'
import SplitPane from 'react-split-pane'
import { useRecoilState } from 'recoil'
import { layoutState } from '../../recoil/atoms'
import { nanoid } from 'nanoid'
import { get } from 'lodash'

export interface PanelDescriptor {
  index: number
  name: string,
  icon: React.ReactElement<any>,
  component: React.FC<any>,
  staticProps: any
}

export interface PanelProps {
    panelLayout: any,
    onSplitPanel: (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => void,
    onCombinePanel: (path: string) => void,
    onSwitchPanel: (path: string, panelIndex: number) => void,
}

export interface PanelDescriptorProps {
    descriptors: PanelDescriptor[]
}

export const Panels = (props: PanelProps & PanelDescriptorProps) => {

    const { descriptors, ...panelProps } = props
    const { panelLayout, ...rest } = panelProps

    return render(panelLayout, descriptors, rest as PanelProps)
}

export const usePanels = (): PanelProps => {

    const [panelTreeLayout, setPanelTreeLayout] = useRecoilState(layoutState)

    // load layout from localstorage
    useEffect(() => {
        const layout = window.localStorage.getItem('layout')
        trySetLayout(layout != null ? JSON.parse(layout): undefined)
    }, [])

    // save layout to local storage on change
    useEffect(() => {
        window.localStorage.setItem('layout', JSON.stringify(panelTreeLayout))
    }, [panelTreeLayout])

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

    return {
        panelLayout: panelTreeLayout,
        onCombinePanel: onCombine,
        onSplitPanel: onSplit,
        onSwitchPanel: onSwitch
    }
}

const render = (panelLayout: any, descriptors: PanelDescriptor[], props: PanelProps): React.ReactElement<any> => {
    return _render(panelLayout, descriptors, props, '')
}

const _render = (obj: any, descriptors: PanelDescriptor[], props: PanelProps, path: string): React.ReactElement<any> => {

    if (obj['instanceID'] === undefined) 
        return <div className="ERRORDIV_NOINSTANCE"/>
    if (obj['type'] === undefined) 
        return <div className="ERRORDIV_NOTYPE"/>
    if (obj['type'] === 'leaf' && obj['index'] === undefined) 
        return <div className="ERRORDIV_NOINDEX"/>
    if (obj['index'] >= descriptors.length) 
        return <div className="ERRORDIV_OUTOFBOUNDS"/>

    if (obj['type'] === 'leaf')
        return (
            React.createElement(
                descriptors[obj['index']].component, 
                {   
                    ...props, 
                    ...descriptors[obj['index']].staticProps,
                    panelDesc: descriptors,
                    path: path, 
                    panelIndex: obj['index'], 
                    instanceID: obj['instanceID'],
                    style: path=='' ? {
                        flex: '1 1 auto',
                        position: 'relative',
                        maxHeight: '100%',
                        minHeight: '0%'
                    } : {}
                }
            )
        )
    else if ('left' in obj && 'right' in obj)
        return (
            React.createElement(
                SplitPane,
                {
                    split: obj['type'], 
                    defaultSize: "50%", 
                    style: path=='' ? {
                        flex: '1 1 auto',
                        position: 'relative'
                    } : {}
                },
                [
                    _render(obj['left'], descriptors, props, path.concat('l')), 
                    _render(obj['right'], descriptors, props, path.concat('r'))
                ]
            )   
        )
    else 
        return <div className="ERRORDIV_NOCHILDREN"/>
}

const arrpath = (path: string): string[] => Array.from(path).map(c=>c==='l'?'left':'right')

const replaceAtPath = (obj: any, path: string, f: (obj: any) => void): any | undefined => {
    const apath = arrpath(path)
    const objAtPath = apath.length == 0 ? obj : get(obj, apath)
    if (objAtPath === undefined) 
        return false
    return apath.length == 0 ? f(objAtPath): set(apath, f(objAtPath), obj)
}

const instances = (obj: any): string[] => {
    const _instances = (obj: any, path: string): string[] => {
        const self = get(obj, arrpath(path).concat('instanceID'))
        return self === undefined ? [] : [self].concat(_instances(obj, path.concat('l'))).concat(_instances(obj, path.concat('r')))
    }
    return _instances(obj, '')
}

const genID = () => nanoid(8)
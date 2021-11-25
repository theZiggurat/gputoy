import React, { LegacyRef, ReactElement, ReactNode, useCallback, useEffect, useRef } from 'react'
import SplitPane from 'react-split-pane'
import { DefaultValue, useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { layoutState } from '../../recoil/atoms'
import { set } from 'lodash/fp'
import { get } from 'lodash'
import { nanoid } from 'nanoid'
import useHorizontalScroll from '../../utils/scrollHook'
import {RiArrowDropUpLine, RiArrowDropDownLine } from 'react-icons/ri'
import {VscSplitHorizontal, VscSplitVertical, VscClose} from 'react-icons/vsc'
import { 
  Flex, 
  Box, 
  IconButton, 
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Text,
  Portal,
  Divider
} from '@chakra-ui/react'
import useInstance, { useInstanceCleaner, useInstances } from '../../recoil/instance'


// --------- CUSTOM PANEL INTERFACES  --------------

export interface PanelDescriptor {
  index: number
  name: string,
  icon: React.ReactElement<any>,
  component: React.FC<any>,
  single?: boolean
}

export interface DynamicPanelProps {
  instanceID: number
}

// --------- PANEL --------------

export interface PanelInProps {
  children: ReactElement[],
  path?: string,
  panelIndex?: number,
  panelDesc?: PanelDescriptor[],
  onSplitPanel?: (path: string, dir: 'vertical' | 'horizontal', idx: number) => void,
  onCombinePanel?: (path: string) => void,
  onSwitchPanel?: (path: string, panelIndex: number) => void,
  instanceID: string,
}

export const Panel = (props: PanelInProps) => {

  const [barLocation, setBarLocation] = React.useState('bottom')
  const [instanceState, setInstance] = useInstance(props)

  // on mount, set the instance to either what it was before
  // or default value if there was no value before
  useEffect(() => setInstance(instanceState), [])

  const onChangeLocation = () => {
    setBarLocation(barLocation == 'top' ? 'bottom': 'top')
  }

  const {children, ...paneProps} = props 
  const bounds = React.useRef<HTMLDivElement>()
    
  return (
    <Flex 
      height="100%" 
      width="100%"
      flexDir={barLocation == 'top' ? 'column-reverse':'column'}
      flexBasis="fill"
      {...paneProps}
      ref={bounds as LegacyRef<HTMLDivElement>}
    >
      {
        React.Children.map(props.children, (elem: ReactElement<any>) => {
        //if (elem.type === PanelBar)
          return React.cloneElement(elem, {
            location: barLocation, 
            onChangeLocation: onChangeLocation,
            path: props.path,
            onSplitPanel: props.onSplitPanel,
            onCombinePanel: props.onCombinePanel,
            onSwitchPanel: props.onSwitchPanel,
            panelDesc: props.panelDesc,
            panelIndex: props.panelIndex,
            clippingBoundary: bounds.current,
            instanceID: props.instanceID
          })
        //else
          //return elem
      })}
    </Flex>
  )
}

// --------- PANEL CONTENT --------------

interface PanelContentProps {
  children: ReactNode
}
export const PanelContent = (props: PanelContentProps & any) => {
  const {children, ...contentProps} = props
  return (
    <Box 
      flex="1 1 auto"
      overflowY="auto"
      overflowX="clip"
      {...contentProps}
    >
      {props.children}
    </Box>
  )
}

// --------- PANEL BAR --------------

type BarLocation = 'top' | 'bottom'
interface PanelBarProps {
  children?: ReactElement<any>[],
  location?: BarLocation,
  onChangeLocation?: () => void,
  path?: string,
  onSplitPanel?: (path: string, dir: 'vertical' | 'horizontal', idx: number) => void,
  onCombinePanel?: (path: string) => void,
  onSwitchPanel?: (path: string, panelIndex: number) => void,
  panelIndex?: number,
  panelDesc?: PanelDescriptor[],
  clippingBoundary?: HTMLDivElement
  preventScroll?: boolean,
  instanceID?: string,
}
export const PanelBar = (props: PanelBarProps) => {

  const instances = useInstances()

  const scrollRef = useHorizontalScroll(Boolean(props.preventScroll))
  const onHandleSplitVertical = (idx: number) => props.onSplitPanel!(props.path!, 'horizontal', idx)
  const onHandleSplitHorizontal = (idx: number) => props.onSplitPanel!(props.path!, 'vertical', idx)
  const onHandleCombine = () => props.onCombinePanel!(props.path!)
  const onHandleSwitch = (index: number) => props.onSwitchPanel!(props.path!, index)
  const {children, location, onChangeLocation, ...barProps} = props

  return (
    <Flex 
      maxHeight={12}
      backgroundColor='gray.850'
      direction="row"
      alignItems="center"
      flex="0 0 auto"
      justify="space-between"
      overflowX="hidden"
      p={1}
      ref={scrollRef  as LegacyRef<HTMLDivElement>}
      {...barProps}
    >
      <Flex dir="row" flex="1 0 auto">
        <Popover 
          isLazy
          placement='top-start'
          gutter={0}
          boundary={props.clippingBoundary}
          modifiers={[
            {
              name: 'preventOverflow',
              options: {
                tether: false,
              }
            }
          ]}
        >
          <PopoverTrigger>
            <Button 
              size="sm"
              width={12}
              pl={0}
              pr={1}
              leftIcon={<RiArrowDropUpLine size={15}/>}
              rightIcon={props.panelDesc![props.panelIndex!].icon} 
              iconSpacing={0}
              variant="solid"  
              aria-label="Choose panel"
              title="Choose panel"
              borderEndRadius="0"
            />
          </PopoverTrigger>
          <Portal>
            <PopoverContent 
              width="fit-content"
              backgroundColor="gray.850"
              borderColor="blackAlpha.100"
            >
              <Flex direction="column">
                {
                  props.panelDesc!.map((desc, idx) => 
                  <PanelSelectorButton 
                    icon={desc.icon} 
                    title={desc.name}
                    onSwitch={() => onHandleSwitch(desc.index)}
                    onHandleSplitHorizontal={() => onHandleSplitHorizontal(idx)}
                    onHandleSplitVertical={() => onHandleSplitVertical(idx)}
                    last={idx==props.panelDesc!.length-1}
                    first={idx==0}
                    disabled={instances.map(sel => sel.index).includes(idx) && desc.single}
                  />)
                }                  
              </Flex>
            </PopoverContent>
          </Portal>
        </Popover>
        <IconButton 
          size="sm"
          icon={<VscClose/>} 
          variant="solid"  
          aria-label="Close Panel"
          title="Close Panel"
          borderEndRadius="25%"
          borderStartRadius="0%"
          borderLeft="1px"
          borderColor="blackAlpha.300"
          onClick={onHandleCombine}
          disabled={props.path==''}
        />
      </Flex>
      {children}
    </Flex>
  )

}

// --------- PANEL BAR MIDDLE --------------

export const PanelBarMiddle = (props: {children: ReactElement[] | ReactElement} | any) => {
  const {children, ...flexprops} = props
  return (
    <Flex dir="row" flex="0 0 auto" justifyContent="center" {...flexprops} pr={1} pl={1}>
      {props.children}
    </Flex>
  )
}

// --------- PANEL BAR END --------------

export const PanelBarEnd = (props: {children: ReactElement[] | ReactElement} | any) => {
  return (
    <Flex dir="row" flex="1 0 auto" justifyContent="end">
      {props.children}
    </Flex>
  )
}

// --------- PANEL BAR SELECTOR --------------

interface PaneSelectorButtonProps {
  icon: React.ReactElement,
  title: string,
  onHandleSplitHorizontal: () => void,
  onHandleSplitVertical: () => void,
  onSwitch: () => void,
  last: boolean,
  first: boolean,
  disabled?: boolean
}

const PanelSelectorButton = (props: PaneSelectorButtonProps) => {

  return (
    <>
      <Flex justifyContent="end">
        <Button 
          flex="1 1 auto"
          backgroundColor="whiteAlpha.100"
          size="sm"
          leftIcon={props.icon}
          border="none"
          justifyContent="left"
          iconSpacing="4"
          borderEndRadius="0%"
          borderStartRadius={props.first?"":"0"}
          borderBottomRadius="0"
          onClick={props.onSwitch}
          pl={2}
          disabled={props.disabled}
        >
          <Text fontSize="xs" fontWeight="thin">{props.title}</Text>
        </Button>
        <IconButton 
          backgroundColor="whiteAlpha.100"
          size="sm"
          icon={<VscSplitHorizontal/>} 
          aria-label="Split panel horizontally"
          title="Split panel horizontally"
          borderRadius="0"
          border="0"
          onClick={props.onHandleSplitHorizontal}
          disabled={props.disabled}
        />
        <IconButton 
          backgroundColor="whiteAlpha.100"
          size="sm"
          icon={<VscSplitVertical/>} 
          aria-label="Split panel vertically"
          title="Split panel vertically"
          border="0"
          borderStartRadius="0%"
          borderEndRadius={props.first?"":"0"}
          borderBottomRightRadius={props.last?"":"0"}
          onClick={props.onHandleSplitVertical}
          disabled={props.disabled}
        />
      </Flex>
      {!props.last && <Divider/>}
    </>
  )
}

// --------- PANEL HOOK --------------

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

    return _render(panelLayout, descriptors, rest as PanelProps, '')
}

export const usePanels = (): PanelProps => {

    const [panelTreeLayout, setPanelTreeLayout] = useRecoilState(layoutState)
    const cleaner = useInstanceCleaner()

    // load layout from localstorage
    useEffect(() => {
        const layout = window.localStorage.getItem('layout')
        trySetLayout(layout != null ? JSON.parse(layout): undefined)
    }, [])

    // save layout to local storage on change
    useEffect(() => {
        window.localStorage.setItem('layout', JSON.stringify(panelTreeLayout))
        cleaner(instances(panelTreeLayout))
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
                    defaultSize: "65%", 
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

const instances = (obj: any): any[] => {
    const _instances = (obj: any, path: string): any[] => {
        const selfID = get(obj, arrpath(path).concat('instanceID'))
        const selfIndex = get(obj, arrpath(path).concat('index'))
        return selfID === undefined ? [] : [{id: selfID, index: selfIndex}].concat(_instances(obj, path.concat('l'))).concat(_instances(obj, path.concat('r')))
    }
    return _instances(obj, '')
}

const genID = () => nanoid(8)
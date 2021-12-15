import React, { LegacyRef, ReactElement, ReactNode, useCallback, useEffect, useRef } from 'react'
import SplitPane from 'react-split-pane'
import { DefaultValue, useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil'
import { layoutState, PanelProps } from '../../recoil/layout'
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
  Divider,
  useColorModeValue
} from '@chakra-ui/react'
import useInstance, { useInstanceCleaner, useInstances } from '../../recoil/instance'
import { RowButton } from '../reusable/rowButton'
import { themed } from '../../theme/theme'
import { lightResizer, darkResizer } from '../../theme/consts'


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
      backgroundColor={themed('a2')}
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
            <IconButton 
              icon={props.panelDesc![props.panelIndex!].icon}
              borderRightRadius="0"
              purpose="Choose panel"
            />
          </PopoverTrigger>
          <Portal>
            <PopoverContent 
              width="fit-content"
              backgroundColor={themed('a2')}
              borderColor="transparent"
            >
              <Flex direction="column">
                {
                  props.panelDesc!.map((desc, idx) => 
                  idx !== 0 &&
                  <PanelSelectorButton 
                    icon={desc.icon} 
                    title={desc.name}
                    onSwitch={() => onHandleSwitch(desc.index+1)}
                    onHandleSplitHorizontal={() => onHandleSplitHorizontal(idx)}
                    onHandleSplitVertical={() => onHandleSplitVertical(idx)}
                    last={idx==props.panelDesc!.length-1}
                    first={idx==1}
                    disabled={instances.map(sel => sel.index).includes(idx) && desc.single}
                  />)
                }                  
              </Flex>
            </PopoverContent>
          </Portal>
        </Popover>
        <RowButton 
          icon={<VscClose/>}
          purpose="Close Panel"
          onClick={onHandleCombine}
          disabled={props.path==''}
          last
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
          aria-label={`Replace panel with ${props.title}`}
          title={`Replace panel with ${props.title}`}
          flex="1 1 auto"
          size="sm"
          leftIcon={props.icon}
          border="none"
          justifyContent="left"
          iconSpacing="4"
          borderEndRadius="0%"
          borderStartRadius={props.first?"":"0"}
          borderBottomRadius="0"
          onClick={props.onSwitch}
          pl={3}
          disabled={props.disabled}
        >
          <Text fontSize="xs" fontWeight="thin">{props.title}</Text>
        </Button>
        <IconButton 
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



export interface PanelDescriptorProps {
    descriptors: PanelDescriptor[]
}

export const Panels = (props: PanelProps & PanelDescriptorProps) => {

    const { descriptors, ...panelProps } = props
    const { panelLayout, ...rest } = panelProps

    return _render(panelLayout, descriptors, rest as PanelProps, '')
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
                    key: obj['instanceID'],
                    split: obj['type'], 
                    defaultSize: obj['size'] ?? "50%",
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
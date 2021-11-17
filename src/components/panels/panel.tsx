import React, { ReactElement, ReactNode } from 'react'
import { 
  Flex, 
  Box, 
  IconButton, 
  Button,
  useColorModeValue,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  Text,
  Portal,
  Stack,
  HStack,
  Divider
} from '@chakra-ui/react'
import {RiArrowDropUpLine, RiArrowDropDownLine } from 'react-icons/ri'
import {VscSplitHorizontal, VscSplitVertical, VscClose} from 'react-icons/vsc'
import {PanelDescriptor} from '../../../pages/create'

interface PanelContentProps {
  children: ReactNode
}
export const PanelContent = (props: PanelContentProps) => {
  const {children, ...contentProps} = props
  return <Box 
    flex="1 1 auto"
    overflowY="overlay"
    {...contentProps}
  >
    {props.children}
  </Box>
}

interface PaneSelectorButtonProps {
  icon: React.ReactElement,
  title: string,
  onHandleSplitHorizontal: () => void,
  onHandleSplitVertical: () => void,
  onSwitch: () => void,
  last: boolean
}

const PanelSelectorButton = (props: PaneSelectorButtonProps) => {

  return (
    <>
      <Flex justifyContent="end">
        <Button 
          flex="1 1 auto"
          size="sm"
          //minW="100"
          leftIcon={props.icon}
          variant="outline"
          border="none"
          justifyContent="left"
          iconSpacing="4"
          onClick={props.onSwitch}
          borderEndRadius="0%"
        >
        <Text fontSize="xs" fontWeight="thin">{props.title}</Text>
        </Button>
        <IconButton 
          variant="outline"
          size="sm"
          icon={<VscSplitHorizontal/>} 
          aria-label="Split panel horizontally"
          title="Split panel horizontally"
          borderRadius="0"
          border="0"
          onClick={props.onHandleSplitHorizontal}
        />
        <IconButton 
          //outline="0"
          variant="outline"
          size="sm"
          icon={<VscSplitVertical/>} 
          aria-label="Split panel vertically"
          title="Split panel vertically"
          borderStartRadius="0%"
          border="0"
          onClick={props.onHandleSplitVertical}
        />
      </Flex>
      {!props.last && <Divider/>}
    </>
  )
}

export const PanelBarMiddle = (props: {children: ReactNode}) => {
  return (
    <Flex dir="row" flex="0 0 auto" justifyContent="center">
      {props.children}
    </Flex>
  )
}

export const PanelBarEnd = (props: {children: ReactNode}) => {
  return (
    <Flex dir="row" flex="1 1 auto" justifyContent="right">
      {props.children}
    </Flex>
  )
}

interface PanelBarProps {
  children: ReactNode,
  location?: BarLocation,
  onChangeLocation?: () => void,
  path: string,
  onSplitPanel: (path: string, dir: 'vertical' | 'horizontal', idx: number) => void,
  onCombinePanel: (path: string) => void,
  onSwitchPanel: (path: string, panelIndex: number) => void,
  panelIndex: number,
  panelDesc: PanelDescriptor[],
}
export const PanelBar = (props: PanelBarProps) => {

    const onHandleSplitVertical = (idx: number) => props.onSplitPanel(props.path, 'horizontal', idx)
    const onHandleSplitHorizontal = (idx: number) => props.onSplitPanel(props.path, 'vertical', idx)
    const onHandleCombine = () => props.onCombinePanel(props.path)
    const onHandleSwitch = (index: number) => props.onSwitchPanel(props.path, index) 

    const {children, location, onChangeLocation, ...barProps} = props
    return (
      <Flex 
        maxHeight={12}
        backgroundColor='gray.850'
        direction="row"
        alignItems="center"
        flex="0 0 auto"
        justify="space-between"
        justifyContent="center"
        borderTop={location == 'bottom' ? '1px':'0'}
        borderBottom={location == 'top' ? '1px':'0'}
        borderColor="blackAlpha.400"
        overflow="hidden"
        pt={1}
        pb={1}
        {...barProps}
      >
        <Flex ml={2} mr={2} flex="1 1 auto">
          <IconButton
            aria-label="Swap bar position"
            size="sm"
            icon={location == 'top' ? <RiArrowDropDownLine size={20}/>: <RiArrowDropUpLine size={20}/>}
            onClick={onChangeLocation}
            borderStartRadius="25%"
            borderEndRadius="0%"
            borderRight="1px"
            borderColor="blackAlpha.300"
          />
          <Popover 
            computePositionOnMount 
            placement='top-end'
            gutter={15}
            preventOverflow
          >
            <PopoverTrigger>
              <IconButton 
                size="sm"
                icon={props.panelDesc[props.panelIndex].icon} 
                variant="solid"  
                aria-label="Choose panel"
                title="Choose panel"
                borderRadius="0"
                borderRight="1px"
                borderColor="blackAlpha.300"
              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent 
                width="fit-content"
                backgroundColor="gray.900"
                borderColor="blackAlpha.100"
              >
                <PopoverArrow backgroundColor="gray.900"/>
                <Flex direction="column">
                  {
                    props.panelDesc.map((desc, idx) => 
                    <PanelSelectorButton 
                      icon={desc.icon} 
                      title={desc.name}
                      onSwitch={() => onHandleSwitch(desc.index)}
                      onHandleSplitHorizontal={() => onHandleSplitHorizontal(idx)}
                      onHandleSplitVertical={() => onHandleSplitVertical(idx)}
                      last={idx==props.panelDesc.length-1}
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

type BarLocation = 'top' | 'bottom'

interface PanelProps {
  children: ReactElement[],
  path: string,
  panelIndex: number,
  panelDesc: PanelDescriptor[],
  onSplitPanel: (path: string, dir: 'vertical' | 'horizontal', idx: number) => void,
  onCombinePanel: (path: string) => void,
  onSwitchPanel: (path: string, panelIndex: number) => void,
}
const Panel = (props: PanelProps) => {

  const [barLocation, setBarLocation] = React.useState('bottom')

  const onChangeLocation = () => {
    setBarLocation(barLocation == 'top' ? 'bottom': 'top')
  }

  const {children, ...paneProps} = props 
    
  return (
    <Flex 
      height="100%" 
      width="100%"
      flexDir={barLocation == 'top' ? 'column-reverse':'column'}
      flexBasis="fill"
      {...paneProps}
    >
      {React.Children.map(props.children, (elem: ReactElement<any>) => {
        if (elem.type.name == 'PanelBar')
          return React.cloneElement(elem, {
            location: barLocation, 
            onChangeLocation: onChangeLocation,
            path: props.path,
            onSplitPanel: props.onSplitPanel,
            onCombinePanel: props.onCombinePanel,
            onSwitchPanel: props.onSwitchPanel,
            panelDesc: props.panelDesc,
            panelIndex: props.panelIndex,
          })
        else
          return elem
      })}
    </Flex>
  )
}

export default Panel
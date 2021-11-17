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
  Stack
} from '@chakra-ui/react'
import {FaBorderNone, FaTerminal} from 'react-icons/fa'
import {BsTerminalFill, BsFillFileSpreadsheetFill} from 'react-icons/bs'
import {RiSplitCellsHorizontal, RiSplitCellsVertical, RiArrowDropUpLine, RiArrowDropDownLine } from 'react-icons/ri'
import _ from 'lodash'


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
}

const PanelSelectorButton = (props: PaneSelectorButtonProps) => {
  return <Button 
    //display="flex"
    //justifyContent="center"
    //alignItems="center"
    size="sm"
    leftIcon={props.icon}
    variant="outline"
    border="none"
    justifyContent="left"
    iconSpacing="4"
  >
    <Text fontSize="sm" fontWeight="thin">{props.title}</Text>
  </Button>

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
}
export class PanelBar extends React.Component<PanelBarProps, {}> {

  render(){
    const {children, location, onChangeLocation, ...barProps} = this.props
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
            icon={location == 'top' ? <RiArrowDropDownLine/>: <RiArrowDropUpLine/>}
            onClick={onChangeLocation}
            borderStartRadius="100%"
            borderEndRadius="0%"
            borderRight="1px"
            borderColor="blackAlpha.300"
          />
          <Popover 
            computePositionOnMount 
            placement='top-end'
            gutter={15}
            // onOpen={onOpen}
            // onClose={onClose}
            // isOpen={isOpen}
          >
            <PopoverTrigger>
              <IconButton 
                size="sm"
                icon={<FaBorderNone/>} 
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
                <Stack>
                  <PanelSelectorButton icon={<FaBorderNone/>} title="Viewport"/>
                  <PanelSelectorButton icon={<BsTerminalFill/>} title="Console"/>
                  <PanelSelectorButton icon={<BsFillFileSpreadsheetFill/>} title="Params"/>
                </Stack>
              </PopoverContent>
            </Portal>
          </Popover>
          <IconButton 
            size="sm"
            icon={<RiSplitCellsHorizontal/>} 
            variant="solid"  
            aria-label="Split panel horizontally"
            title="Split panel horizontally"
            borderRadius="0%"
            />
          <IconButton 
            size="sm"
            icon={<RiSplitCellsVertical/>} 
            variant="solid"  
            aria-label="Split panel vertically"
            title="Split panel vertically"
            borderEndRadius="100%"
            borderStartRadius="0%"
            borderLeft="1px"
            borderColor="blackAlpha.300"
          />
      </Flex>
        {children}

        
      </Flex>
    )
  }
}

type BarLocation = 'top' | 'bottom'

interface PanelProps {
  children: ReactElement[],
  panelIcon?: ReactElement<any>
}
interface PanelState {
  barLocation: BarLocation
}

export default class Panel extends React.Component<PanelProps, PanelState> {

  constructor(props: PanelProps) {
    super(props)
    this.state = {
      barLocation: 'bottom'
    }
  }

  onChangeLocation = () => {
    this.setState(oldState => {
      return {...oldState, barLocation: oldState.barLocation == 'top' ? 'bottom': 'top'}
    })
  }

  render() {
    const {children, panelIcon, ...paneProps} = this.props
    
    return (
      <Flex 
        height="100%" 
        width="100%"
        flexDir={this.state.barLocation == 'top' ? 'column-reverse':'column'}
        flexBasis="fill"
        {...paneProps}
      >
        {React.Children.map(this.props.children, (elem: ReactElement<any>) => {
          console.log(elem)
          if (elem.type.name == 'PanelBar'){
            console.log('found')
            return React.cloneElement(elem, {location: this.state.barLocation, onChangeLocation: this.onChangeLocation})
          }
            
          else
            return elem
        })}
      </Flex>
    )
  }

}
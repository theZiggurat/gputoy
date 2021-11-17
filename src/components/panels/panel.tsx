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
    <Text fontSize="xs" fontWeight="thin">{props.title}</Text>
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
  path: string,
  onSplit: (path: string, dir: 'vertical' | 'horizontal') => void,
  onCombine: (path: string) => void,
  panelIndex: number,
  panelDesc: PanelDescriptor[],
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
            // onOpen={onOpen}
            // onClose={onClose}
            // isOpen={isOpen}
          >
            <PopoverTrigger>
              <IconButton 
                size="sm"
                icon={this.props.panelDesc[this.props.panelIndex].icon} 
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
                  {
                    this.props.panelDesc.map(desc => 
                    <PanelSelectorButton 
                      icon={desc.icon} 
                      title={desc.name}
                    />)
                  }                  
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
            onClick={() => this.props.onSplit(this.props.path, 'horizontal')}
            />
          <IconButton 
            size="sm"
            icon={<RiSplitCellsVertical/>} 
            variant="solid"  
            aria-label="Split panel vertically"
            title="Split panel vertically"
            borderEndRadius="25%"
            borderStartRadius="0%"
            borderLeft="1px"
            borderColor="blackAlpha.300"
            onClick={() => this.props.onSplit(this.props.path, 'vertical')}
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
  path: string,
  panelIndex: number,
  panelDesc: PanelDescriptor[],
  onSplit: (path: string, dir: 'vertical' | 'horizontal') => void,
  onCombine: (path: string) => void,
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
    console.log(this.props)
  }

  onChangeLocation = () => {
    this.setState(oldState => {
      return {...oldState, barLocation: oldState.barLocation == 'top' ? 'bottom': 'top'}
    })
  }

  render() {
    const {children, ...paneProps} = this.props 
    
    return (
      <Flex 
        height="100%" 
        width="100%"
        flexDir={this.state.barLocation == 'top' ? 'column-reverse':'column'}
        flexBasis="fill"
        {...paneProps}
      >
        {React.Children.map(this.props.children, (elem: ReactElement<any>) => {
          if (elem.type.name == 'PanelBar')
            return React.cloneElement(elem, {
              location: this.state.barLocation, 
              onChangeLocation: this.onChangeLocation,
              path: this.props.path,
              onSplit: this.props.onSplit,
              onCombine: this.props.onCombine,
              panelDesc: this.props.panelDesc,
              panelIndex: this.props.panelIndex,
            })
          else
            return elem
        })}
      </Flex>
    )
  }

}
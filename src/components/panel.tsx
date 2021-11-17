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

interface PanelBarProps {
  children: ReactNode,
  location: BarLocation,
  onChangeLocation: () => void,
}
export class PanelBar extends React.Component<PanelBarProps, {}> {

  render(){
    const {children, location, onChangeLocation, ...barProps} = this.props
    return (
      <Flex 
        maxHeight={12}
        //backgroundColor={useColorModeValue('gray.150', 'gray.850')}
        direction="row"
        alignItems="center"
        flex="0 0 auto"
        justify="space-between"
        borderTop="1px"
        borderColor="whiteAlpha.100"
        overflow="hidden"
        pt={1}
        pb={1}
        {...barProps}
      >
        <Popover 
          computePositionOnMount 
          placement='top-end'
          gutter={20}
          // onOpen={onOpen}
          // onClose={onClose}
          // isOpen={isOpen}
        >
          <PopoverTrigger>
            <IconButton 
              m={2}
              size="sm"
              icon={<FaBorderNone/>} 
              variant="solid"  
              aria-label="Choose panel"
              title="Choose panel"
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
          <IconButton 
            m={2}
            size="sm"
            icon={<RiSplitCellsHorizontal/>} 
            variant="solid"  
            aria-label="Split panel horizontally"
            title="Split panel horizontally"
          />
          <IconButton 
            
            m={2}
            size="sm"
            icon={<RiSplitCellsVertical/>} 
            variant="solid"  
            aria-label="Split panel vertically"
            title="Split panel vertically"
          />
        </Popover>
        {children}

        <IconButton
          
          display="contents"
          aria-label="Swap bar position"
          size="lg"
          icon={location == 'top' ? <RiArrowDropDownLine/>: <RiArrowDropUpLine/>}
          onClick={onChangeLocation}
          variant="unstyled"
        />&nbsp;&nbsp;
      </Flex>
    )
  }
}

type BarLocation = 'top' | 'bottom'

interface PanelProps {
  children: ReactElement[],
  panelIcon: ReactElement<any>
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
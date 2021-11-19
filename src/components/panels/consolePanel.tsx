import React, { useEffect } from 'react'
import { 
  chakra, 
  Box, Text, 
  Flex, 
  useColorModeValue, 
  Divider, 
  IconButton,
  Checkbox,
  CheckboxGroup,
  useCheckboxGroup,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  useToast
} from "@chakra-ui/react";
import {FaRegClipboard, FaRegTrashAlt, FaSearch} from 'react-icons/fa'
import {CloseIcon} from '@chakra-ui/icons'
import Console, {Message, MessageType} from '../../gpu/console'
import { RowButton, RowToggleButton} from '../reusable/rowButton';

import Panel, { PanelContent, PanelBar, PanelBarMiddle, PanelBarEnd } from './panel';
import { MdSettings } from 'react-icons/md';

const colors = [
  "green",
  "blue",
  "orange",
  "red"
]

const prehead = [
  "[--Trace--] ",
  "[---Log---] ",
  "[--Error--] ",
  "[--Fatal--] ",
]

const f = (n: number) => ('0' + n).slice(-2)
const formatTime = (date: Date) => `${f(date.getHours())}:${f(date.getMinutes())}:${f(date.getSeconds())}`

const LogLevelCheckboxes = (props: {filters: boolean[], toggle: (idx: number, val: boolean) => void}) => (
  <>
    
    {/* <RowToggleButton  ml={3} aria-label="Trace" title="Trace" size="sm"
      isChecked={props.filters[0]}
      onChange={ev => props.toggle(0, ev.target.checked)}
    > Trace </RowToggleButton>
    <RowToggleButton ml={3} value="Log" aria-label="Log" title="Log" size="sm"
      isChecked={props.filters[1]}
      onChange={ev => props.toggle(1, ev.target.checked)}
    > Log </RowToggleButton>
    <RowToggleButton  ml={3} value="Error" aria-label="Error" title="Error" size="sm"
      isChecked={props.filters[2]}
      onChange={ev => props.toggle(2, ev.target.checked)}
    > Error</RowToggleButton>
    <RowToggleButton ml={3} value="Fatal" aria-label="Fatal" title="Fatal" size="sm"
      isChecked={props.filters[3]}
      onChange={ev => props.toggle(3, ev.target.checked)}
    > Fatal </RowToggleButton> */}
  </>
)

const ConsolePanel: React.FC<{}> = (props: any) => {

  const [text, setText] = React.useState(Console.getBuffer())

  const [typeFilters, setTypeFilters] = React.useState([true, true, true, true])
  const [keywordFilter, setKeywordFilter] = React.useState('')
  
  const [autoscroll, setAutoscroll] = React.useState(true)
  const bottom = React.useRef<HTMLDivElement>(null)

  const toast = useToast()

  useEffect(() => Console.setOnMessage(() => {
    setText([...Console.getFiltered()])
  }), [])

  useEffect(() => {
    Console.setKeywordFilter(keywordFilter)
    Console.setTypeFilter(typeFilters)
    setText([...Console.getFiltered()])
  }, [typeFilters, keywordFilter])

  /**
   * Automatic scrolling to bottom
   */
  useEffect(
    () => {
      if(autoscroll)
        bottom.current?.scrollIntoView({ 
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        }
    )}, [text])

  const toggle = (idx: number) => setTypeFilters(old => {
    var filters = [...old]
    filters[idx] = !old[idx]
    Console.setTypeFilter(filters)
    return filters
  })

  const writeToClipboard = () => {
    navigator.clipboard.writeText(
      Console.getBuffer().map(line => 
        `${formatTime(line.time)}  ${prehead[line.type]} ${line.header}: ${line.body}`
      ).join('\n')
    )
    toast({
      title: 'Copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }

  return(
    <Panel {...props}>
      <PanelContent 
        fontFamily='"Fira code", "Fira Mono", monospace' 
        fontSize="sm" 
      >
        {text.map((message: Message, idx) => 
            <Box 
              key={idx}
              //backgroundColor={idx%2==0?'':'blackAlpha.100'}
              p={1} 
              flex="0 0 auto" 
              whiteSpace="pre-wrap"
            >
              <Text ml={1}>
                <chakra.span fontWeight="hairline">
                {formatTime(message.time)}&nbsp;&nbsp;
                </chakra.span>
                <chakra.span color={colors[message.type].concat('.200')} fontWeight="black">
                  {prehead[message.type]}{message.header}:&nbsp;
                </chakra.span>
                {message.body}
              </Text>
            </Box>
        )}
        <div ref={bottom}></div>
      </PanelContent>
      <PanelBar>
        {/* search & type filters */}
        <PanelBarMiddle>
          <InputGroup size="sm" variant="filled" maxWidth="500" minWidth="100">
            <InputLeftElement
              children={<FaSearch/>}
            />
            <Input
              borderEndRadius="0"
              borderRadius="md"
              value={keywordFilter}
              onChange={ev => setKeywordFilter(ev.target.value)}
            />
            {
              keywordFilter.length > 0 &&
              <InputRightElement
                children={<CloseIcon size="sm"/>}
                onClick={() => setKeywordFilter('')}
              />
            }
          </InputGroup>
          {/* <LogLevelCheckboxes filters={typeFilters} toggle={toggle}/> */}
          <RowToggleButton text="Trace" toggled={typeFilters[0]} onClick={() => toggle(0)}/>
          <RowToggleButton text="Log"   toggled={typeFilters[1]} onClick={() => toggle(1)}/>
          <RowToggleButton text="Error" toggled={typeFilters[2]} onClick={() => toggle(2)}/>
          <RowToggleButton text="Fatal" toggled={typeFilters[3]} onClick={() => toggle(3)} last/>
        </PanelBarMiddle>

        {/* utility buttons */}
        <PanelBarEnd>
          {/* <Checkbox mr={4} size="sm"
            isChecked={autoscroll}
            onChange={e => setAutoscroll(e.target.checked)}
          >
            Autoscroll
          </Checkbox> */}
          <RowButton
            purpose="Copy console to clipboard"
            size="sm" 
            icon={<FaRegClipboard/>}
            onClick={() => writeToClipboard()}
            disabled={text.length == 0}
            first
          />
          <RowButton 
            purpose="Clear console"
            size="sm" 
            icon={<FaRegTrashAlt/>}
            onClick={() => Console.clear()}
            disabled={text.length == 0}
          />
          <RowButton 
            purpose="Console Settings"
            size="sm" 
            icon={<MdSettings/>}
            last
          />
        </PanelBarEnd>
      </PanelBar>
    </Panel>
  )
}
export default ConsolePanel
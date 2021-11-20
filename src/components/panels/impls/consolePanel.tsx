import React, { useEffect } from 'react'
import { 
  chakra, 
  Box, Text, 
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  useToast
} from "@chakra-ui/react";

import { FaRegClipboard, FaRegTrashAlt, FaSearch } from 'react-icons/fa'
import { CloseIcon } from '@chakra-ui/icons'
import Console, { Message } from '../../../gpu/console'
import { MdSettings } from 'react-icons/md';

import { Panel, PanelContent, PanelBar, PanelBarMiddle, PanelBarEnd, DynamicPanelProps } from '../panel';
import useInstance, { ConsoleInstanceState } from '../instance';
import { RowButton, RowToggleButton} from '../../reusable/rowButton';

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

const ConsolePanel = (props: DynamicPanelProps & any) => {

  const [instanceState, setInstanceState] = useInstance<ConsoleInstanceState>(props)

  const [text, setText] = React.useState(Console.getBuffer())

  const setKeywordFilter = (filter: string) => setInstanceState({...instanceState, keywordFilter: filter})
  const setTypeFilters = (filter: boolean[]) => setInstanceState({...instanceState, typeFilters: filter})

  const [autoscroll, setAutoscroll] = React.useState(true)
  const bottom = React.useRef<HTMLDivElement>(null)

  const toast = useToast()

  useEffect(() => {
    setText([...Console.getFiltered(instanceState.typeFilters, instanceState.keywordFilter)])
  }, [instanceState])

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

  const toggle = (idx: number) => {
    var filters = [...instanceState.typeFilters]
    filters[idx] = !instanceState.typeFilters[idx]
    setTypeFilters(filters)
  }

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
              value={instanceState.keywordFilter}
              onChange={ev => setKeywordFilter(ev.target.value)}
            />
            {
              instanceState.keywordFilter.length > 0 &&
              <InputRightElement
                children={<CloseIcon size="sm"/>}
                onClick={() => setKeywordFilter('')}
              />
            }
          </InputGroup>
          {/* <LogLevelCheckboxes filters={typeFilters} toggle={toggle}/> */}
          <RowToggleButton text="Trace" toggled={instanceState.typeFilters[0]} onClick={() => toggle(0)}/>
          <RowToggleButton text="Log"   toggled={instanceState.typeFilters[1]} onClick={() => toggle(1)}/>
          <RowToggleButton text="Error" toggled={instanceState.typeFilters[2]} onClick={() => toggle(2)}/>
          <RowToggleButton text="Fatal" toggled={instanceState.typeFilters[3]} onClick={() => toggle(3)} last/>
        </PanelBarMiddle>

        <PanelBarEnd>
          <RowButton
            purpose="Copy console to clipboard"
            icon={<FaRegClipboard/>}
            onClick={() => writeToClipboard()}
            disabled={text.length == 0}
            first
          />
          <RowButton 
            purpose="Clear console"
            icon={<FaRegTrashAlt/>}
            onClick={() => Console.clear()}
            disabled={text.length == 0}
          />
          <RowButton 
            purpose="Console Settings"
            icon={<MdSettings/>}
            last
          />
        </PanelBarEnd>
      </PanelBar>
    </Panel>
  )
}
export default ConsolePanel
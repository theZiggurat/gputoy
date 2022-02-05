import { CloseIcon } from '@chakra-ui/icons';
import {
  Box, Input,
  InputGroup,
  InputLeftElement,
  InputRightElement, Text, useColorModeValue, useToast
} from "@chakra-ui/react";
import { Message } from '@recoil/console';
import useConsole, { useClearConsole } from '@recoil/hooks/useConsole';
import useInstance from '@recoil/hooks/useInstance';
import React, { useEffect } from 'react';
import { FaRegClipboard, FaRegTrashAlt, FaSearch } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { themed } from '../../../theme/theme';
import { RowButton, RowToggleButton } from '../../shared/rowButton';
import { ConsoleInstanceState } from '../descriptors';
import { DynamicPanelProps, Panel, PanelBar, PanelBarEnd, PanelBarMiddle, PanelContent } from '../panel';

const colors = [
  "green",
  "blue",
  "orange",
  "red",
  "purple"
]

const prehead = [
  "[--Trace--] ",
  "[---Log---] ",
  "[--Error--] ",
  "[--Fatal--] ",
  "[--Debug--] ",
]

const f = (n: number) => ('0' + n).slice(-2)
const formatTime = (date: Date) => `${f(date.getHours())}:${f(date.getMinutes())}:${f(date.getSeconds())}`

const ConsolePanel = (props: DynamicPanelProps & any) => {

  const [instanceState, setInstanceState] = useInstance<ConsoleInstanceState>(props)
  const console = useConsole(instanceState.typeFilters, instanceState.keywordFilter)
  const clear = useClearConsole()

  const setKeywordFilter = (filter: string) => setInstanceState({ ...instanceState, keywordFilter: filter })
  const setTypeFilters = (filter: boolean[]) => setInstanceState({ ...instanceState, typeFilters: filter })

  const [autoscroll, setAutoscroll] = React.useState(true)
  const bottom = React.useRef<HTMLDivElement>(null)

  const toast = useToast()
  const consoleFontColorMod = useColorModeValue('.600', '.200')
  const consoleFontWeight = useColorModeValue('bold', 'medium')

  /**
   * Automatic scrolling to bottom
   */
  useEffect(
    () => {
      if (autoscroll)
        bottom.current?.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        }
        )
    }, [console])

  const toggle = (idx: number) => {
    var filters = [...instanceState.typeFilters]
    filters[idx] = !instanceState.typeFilters[idx]
    setTypeFilters(filters)
  }

  const writeToClipboard = () => {
    navigator.clipboard.writeText(
      console.map(line =>
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

  return (
    <Panel {...props}>
      <PanelContent
        fontFamily='"JetBrains Mono", "Fira code", "Fira Mono", monospace'
        fontSize="sm"
        p="0.3rem"
      >
        {console.map((message: Message, idx) =>
          <Box
            key={idx}
            p={1}
            flex="0 0 auto"
            whiteSpace="pre-wrap"
            bg={themed('a3')}
            borderBottom="4px"
            borderColor={themed('p')}
          >
            <Text ml={1}>
              <Text display="inline" color={themed('textMid')} fontFamily="mono">
                {formatTime(message.time)}&nbsp;&nbsp;
              </Text>
              <Text
                color={colors[Math.log2(message.type)].concat(consoleFontColorMod)}
                fontWeight={consoleFontWeight}
                transition="0.2s ease"
                display="inline"
              >
                {prehead[Math.log2(message.type)]}{message.header}:&nbsp;
              </Text>
              <Text display="inline">
                {message.body}
              </Text>

            </Text>
          </Box>
        )}
        <div ref={bottom}></div>
      </PanelContent>
      <PanelBar>
        {/* search & type filters */}
        <PanelBarMiddle>
          <InputGroup maxWidth="500" minWidth="100" size="xs">
            <InputLeftElement>
              <FaSearch />
            </InputLeftElement>
            <Input
              borderStartRadius="md"
              borderEndRadius="0"
              value={instanceState.keywordFilter}
              onChange={ev => setKeywordFilter(ev.target.value)}
            />
            {
              instanceState.keywordFilter.length > 0 &&
              <InputRightElement
                onClick={() => setKeywordFilter('')}
              >
                <CloseIcon size="sm" />
              </InputRightElement>
            }
          </InputGroup>
          {/* <LogLevelCheckboxes filters={typeFilters} toggle={toggle}/> */}
          <RowToggleButton text="Trace" toggled={instanceState.typeFilters[0]} onClick={() => toggle(0)} />
          <RowToggleButton text="Log" toggled={instanceState.typeFilters[1]} onClick={() => toggle(1)} />
          <RowToggleButton text="Error" toggled={instanceState.typeFilters[2]} onClick={() => toggle(2)} />
          <RowToggleButton text="Fatal" toggled={instanceState.typeFilters[3]} onClick={() => toggle(3)} />
          <RowToggleButton text="Debug" toggled={instanceState.typeFilters[4]} onClick={() => toggle(4)} last />
        </PanelBarMiddle>

        <PanelBarEnd>
          <RowButton
            purpose="Copy console to clipboard"
            icon={<FaRegClipboard />}
            onClick={() => writeToClipboard()}
            disabled={console.length == 0}
            first
          />
          <RowButton
            purpose="Clear console"
            icon={<FaRegTrashAlt />}
            onClick={clear}
            disabled={console.length == 0}
          />
          <RowButton
            purpose="Console Settings"
            icon={<MdSettings />}
            last
          />
        </PanelBarEnd>
      </PanelBar>
    </Panel>
  )
}
export default ConsolePanel
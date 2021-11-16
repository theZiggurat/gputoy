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
import Console, {Message, MessageType} from '../../../gpu/console'

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
    <Checkbox  ml={3} aria-label="Trace" title="Trace" size="sm"
      isChecked={props.filters[0]}
      onChange={ev => props.toggle(0, ev.target.checked)}
    > Trace </Checkbox>
    <Checkbox ml={3} value="Log" aria-label="Log" title="Log" size="sm"
      isChecked={props.filters[1]}
      onChange={ev => props.toggle(1, ev.target.checked)}
    > Log </Checkbox>
    <Checkbox  ml={3} value="Error" aria-label="Error" title="Error" size="sm"
      isChecked={props.filters[2]}
      onChange={ev => props.toggle(2, ev.target.checked)}
    > Error</Checkbox>
    <Checkbox ml={3} value="Fatal" aria-label="Fatal" title="Fatal" size="sm"
      isChecked={props.filters[3]}
      onChange={ev => props.toggle(3, ev.target.checked)}
    > Fatal </Checkbox>
  </>
)

const ConsolePanel = () => {

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

  const toggle = (idx: number, val: boolean) => setTypeFilters(old => {
    var filters = [...old]
    filters[idx] = val
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


    <Flex 
      height="100%" 
      maxH="100%" 
      overflowY="hidden" 
      flexDir="column" 
      justify="space-between" 
      flexBasis="fill"
    >
      <Box 
        fontFamily='"Fira code", "Fira Mono", monospace' 
        fontSize="sm" 
        display="flex" 
        flexDirection="column" 
        overflowY="overlay"
        flex="1 1 auto"
        width="100%"
      >
        {text.map((message: Message, idx) => 
          <Flex 
            borderBottom="1px 
            solid" borderColor="whiteAlpha.200" 
            key={idx} 
            backgroundColor={idx%2==0?'':'blackAlpha.100'}
            dir="row"
          >
            <Divider orientation="vertical"/>
            <Box 
              p={1} flex="1 1 auto" whiteSpace="pre-wrap">
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
          </Flex>
        )}
        <Box id="bottom" ref={bottom}></Box>
      </Box>


      <Flex 
        maxHeight={12}
        backgroundColor={useColorModeValue('gray.150', 'gray.850')}
        direction="row"
        alignItems="center"
        flex="0 0 auto"
        justify="space-between"
        borderTop="1px"
        borderColor="whiteAlpha.100"
        overflow="hidden"
        pt={2}
        pb={2}
      >
        <Button/>
        <Flex dir="row" flex="1 0 auto" justifyContent="center">
          <InputGroup ml={2} size="sm" variant="filled" width={500}>
            <InputLeftElement
              children={<FaSearch/>}
            />
            <Input
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
          <LogLevelCheckboxes filters={typeFilters} toggle={toggle}/>
        </Flex>
        <Flex dir="row" flex="0 1 auto" justifyContent="center">
          <Checkbox mr={4} size="sm"
            isChecked={autoscroll}
            onChange={e => setAutoscroll(e.target.checked)}
          >
            Autoscroll
          </Checkbox>
          <Button mr={2} variant="solid" size="sm" fontWeight="hairline"
            leftIcon={<FaRegClipboard/>}
            onClick={() => writeToClipboard()}
            disabled={text.length == 0}
          >
            Copy
          </Button>
          <Button mr={2} variant="solid" size="sm" fontWeight="hairline"
            leftIcon={<FaRegTrashAlt/>}
            onClick={() => Console.clear()}
            disabled={text.length == 0}
          >
            Clear
          </Button>
        </Flex>
        
      </Flex>
    </Flex>
  )
}
export default ConsolePanel
import React, { useEffect, useState } from 'react'
import { Box, Flex, Input, Portal, Text } from '@chakra-ui/react'
import { themed } from 'theme/theme'
import { useRecoilSnapshot } from 'recoil'
import dynamic from 'next/dynamic'

const ReactJson = dynamic(() => import('react-json-view'))

const RecoilDebugPanel = () => {

  const [show, setShow] = useState(false)
  const snapshot = useRecoilSnapshot()
  const [nodes, setNodes] = useState({})
  const [filteredNodes, setFilteredNodes] = useState({})
  const [filter, setFilter] = useState('')

  const onToggleDebugPanel = (ev) => {
    if (ev.key == 'd' && ev.altKey && ev.ctrlKey) {
      ev.preventDefault()
      setShow(s => !s)
    }
  }

  useEffect(() => {
    const filteredRecoilMap = Object.keys(nodes)
      .filter((key) => key.includes(filter))
      .reduce((cur, key) => { return Object.assign(cur, { [key]: nodes[key] }) }, {})
    setFilteredNodes(filteredRecoilMap)
  }, [nodes, filter])

  useEffect(() => {
    const recoilMap = Array.from(snapshot.getNodes_UNSTABLE()).reduce((map, n) => {
      map[n.key] = snapshot.getLoadable(n)["contents"]
      return map
    }, {})
    setNodes(recoilMap)
  }, [snapshot]);

  useEffect(() => {
    document.addEventListener('keydown', onToggleDebugPanel)
    return () => document.removeEventListener('keydown', onToggleDebugPanel)
  }, [])

  return (
    <Portal>
      {
        show &&
        <>
          <Box
            pos="absolute"
            left="0px"
            top="0px"
            width="100%"
            height="100%"
            zIndex={19}
            bg={themed('button')}
            backdropFilter="blur(2px)"
            onClick={() => setShow(false)}
          />
          <Flex
            pos="absolute"
            width="35%"
            height="fit-content"
            maxH="80%"
            border="1px"
            borderColor={themed('border')}
            bg={themed('p')}
            top="10%"
            left="50%"
            zIndex={20}
            transform="translate(-50%, 0)"
            flexDir="column"
            p="1rem"
            gridGap="1rem"
          >
            <Flex gridGap="1rem">
              <Text fontWeight="bold" minW="max-content" color={themed('textMid')}>
                State Debug
              </Text >
              <Input val={filter} onChange={ev => setFilter(ev.target.value)} />
            </Flex>
            <ReactJson
              src={filteredNodes}
              displayDataTypes={false}
              collapsed={1}
              theme="shapeshifter"
              collapseStringsAfterLength={50}
              enableClipboard={false}
              style={{
                background: 'none',
                overflowY: "scroll"
              }}
            />
          </Flex>
        </>
      }

    </Portal>
  )
}

export default RecoilDebugPanel
import React, { useEffect, useRef, useState } from 'react'
import { ParamDesc } from "@gpu/types"
import { SetterOrUpdater, useRecoilState } from "recoil"
import { Flex, Input, Text, Box } from '@chakra-ui/react'
import { themed } from 'theme/theme'
import { useResizeDetector } from 'react-resize-detector'
import { projectParamsAtom } from '@recoil/project'
import Dropdown, { DropdownItem } from '../dropdown'
import Vec2Interface from './interface/vec2Interface'


export const typeToInterface = {
  'int': ['Scroll', 'Step Scroll'],
  'float': ['Scroll', 'Step Scroll'],
  'color': ['RGB', 'HSV'],
  'vec3f': [],
  'vec3i': [],
  'vec2f': ['Radial'],
  'vec2i': [],
}

export const interfaces = {
  'Scroll': Vec2Interface,
  'Radial': Vec2Interface
}

export type InterfaceProps = {
  value: number[],
  onChange: (newval: number[]) => void,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number,
}

export const ParamInterface = (props: { selectedParam: string | null, width: string }) => {

  const [param, setParam] = useRecoilState(projectParamsAtom(props.selectedParam ?? ''))
  const elem = param ? interfaces[typeToInterface[param.paramType][0]] : null
  const { width, height, ref } = useResizeDetector()

  const onHandleValueChange = (newval: number[]) => {
    setParam(old => ({ ...old, param: newval }))
  }

  return <Flex
    width={props.width}
    flex="3 0 auto"
    bg={themed('a3')}
    flexDir="column"
    overflow="scroll"
    borderLeft="1px dashed"
    borderColor={themed('borderLight')}
  >
    <Flex justifyContent="space-between" alignItems="center" flex="0 0 auto" maxW="20rem" >
      <Text p="0.25rem" px="0.5rem" fontSize="xs">
        {param.paramName}
      </Text>
      <Dropdown text="Color" size="xs">
        <DropdownItem text="Color-alpha" />
      </Dropdown>
    </Flex>
    <Box
      m="0.5rem"
      ref={ref}
      borderRadius="5px"
      style={{ aspectRatio: '1/1' }}
    //p="0.5rem"
    //border="1px dashed"
    >
      {
        elem && props.selectedParam &&
        React.createElement(
          elem,
          {
            value: param.param,
            onChange: onHandleValueChange,
            width: width ? width : 0,
            height: height ? height : 0
          }
        )
      }
    </Box>
  </Flex>
}

export const useInterface = (
  props: InterfaceProps,
  toParamSpace: (svgCoord: number[]) => number[],
  fromParamSpace: (paramCoord: number[]) => number[],
) => {
  const ref = useRef<SVGSVGElement | null>(null)
  const [svgCoord, setSVGCoord] = useState(fromParamSpace(props.value))
  const [dragged, setDragged] = useState(false)

  useEffect(() => {
    return () => {
      restoreGlobalMouseEvents();
      document.removeEventListener('mouseup', end, EventListenerMode);
      document.removeEventListener('mousemove', iterate, EventListenerMode);
    }
  }, [])


  const preventGlobalMouseEvents = () => document.body.style['pointer-events'] = 'none'
  const restoreGlobalMouseEvents = () => document.body.style['pointer-events'] = 'auto'

  function iterate(ev: MouseEvent) {
    ev.stopPropagation()
    const windowCoord = [ev.clientX, ev.clientY]
    const svgCoord = toSvgSpace(windowCoord)
    setSVGCoord(svgCoord)
    const paramCoord = toParamSpace(svgCoord)
    props.onChange(paramCoord)
  }

  const EventListenerMode = { capture: true }
  function end(ev: MouseEvent) {
    restoreGlobalMouseEvents()
    document.removeEventListener('mouseup', end, EventListenerMode)
    document.removeEventListener('mousemove', iterate, EventListenerMode)
    ev.stopPropagation()
    setDragged(false)
  }

  function start(ev: MouseEvent) {
    preventGlobalMouseEvents()
    document.addEventListener('mouseup', end, EventListenerMode)
    document.addEventListener('mousemove', iterate, EventListenerMode)
    ev.preventDefault()
    ev.stopPropagation()
    setDragged(true)
  }

  const toDocumentSpace = (vec: number[]): number[] => {
    if (!ref.current) return vec
    const bbox = ref.current.getBoundingClientRect()
    return [vec[0] + bbox.left, vec[1] + bbox.top]
  }

  const toSvgSpace = (vec: number[]): number[] => {
    if (!ref.current) return vec
    const bbox = ref.current.getBoundingClientRect()
    return [vec[0] - bbox.left, vec[1] - bbox.top]
  }


  return {
    svgCoord,
    dragged,
    start,
    toDocumentSpace,
    ref
  }
}



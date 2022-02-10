import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from "recoil"
import { Box, BoxProps, Select } from '@chakra-ui/react'
import { themed } from 'theme/theme'
import { useResizeDetector } from 'react-resize-detector'
import { projectParamsAtom } from 'core/recoil/atoms/project'
import { Vec2InterfaceRadial } from './interface/vec2Interface'
import { FloatInterfaceKnob } from './interface/floatInterface'


export const typeToInterface = {
  'int': ['Knob'],
  'float': ['Knob'],
  'color': ['RGB', 'HSV'],
  'vec3f': [],
  'vec3i': [],
  'vec2f': ['Radial', 'Cartesian'],
  'vec2i': ['Cartesian'],
}

export const interfaces: { [key: string]: ReactNode } = {
  'Scroll': Vec2InterfaceRadial,
  'Radial': Vec2InterfaceRadial,
  'Knob': FloatInterfaceKnob
}

export type InterfaceProps = {
  value: number[],
  onChange: (newval: number[]) => void,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number,
  scroll: number,
}

export const ParamInterface = (props: { selectedParam: string | null } & BoxProps) => {

  const { selectedParam, ...rest } = props

  const [param, setParam] = useRecoilState(projectParamsAtom(props.selectedParam ?? ''))
  const interfaceType = typeToInterface[param.paramType][param.interface ?? 0]
  const paramInterface = param ? interfaces[interfaceType] : null
  const { width, height, ref } = useResizeDetector()
  const [scroll, setScroll] = useState(0)

  const onHandleValueChange = (newval: number[]) => {
    setParam(old => ({ ...old, param: newval }))
  }

  const onHandleWheel = (ev) => setScroll(old => old + ev.deltaY)


  return (

    <Box
      position="relative"
      ref={ref}
      style={{ aspectRatio: '1/1' }}
      flex="0 0 auto"
      bg={themed('a3')}
      flexDir="column"
      borderLeft="1px solid"
      borderColor={themed('dividerLight')}
      overflow="hidden"
      onWheel={onHandleWheel}
      {...rest}
    >


      {
        paramInterface && props.selectedParam &&
        React.createElement(
          paramInterface,
          {
            value: param.param,
            onChange: onHandleValueChange,
            width: width ? width : 0,
            height: height ? height : 0,
            scroll
          }
        )
      }
    </Box>
  )
}

export const useInterface = (
  props: InterfaceProps,
  toParamSpace: (svgCoord: number[]) => number[],
  fromParamSpace: (paramCoord: number[]) => number[],
) => {

  const ref = useRef<SVGSVGElement | null>(null)
  const [svgCoord, setSVGCoord] = useState(fromParamSpace(props.value))
  const [dragged, setDragged] = useState(false)

  const preventGlobalMouseEvents = () => document.body.style.pointerEvents = 'none'
  const restoreGlobalMouseEvents = () => document.body.style.pointerEvents = 'auto'

  const iterate = useCallback((ev: MouseEvent) => {

    const toSvgSpace = (vec: number[]): number[] => {
      if (!ref.current) return vec
      const bbox = ref.current.getBoundingClientRect()
      return [vec[0] - bbox.left, vec[1] - bbox.top]
    }

    ev.stopPropagation()
    const windowCoord = [ev.clientX, ev.clientY]
    const svgCoord = toSvgSpace(windowCoord)
    setSVGCoord(svgCoord)
    const paramCoord = toParamSpace(svgCoord)
    props.onChange(paramCoord)
    //console.log('window', windowCoord, 'svg', svgCoord, 'param', paramCoord)
  }, [toParamSpace, setSVGCoord, props])

  const end = useCallback((ev: MouseEvent) => {
    restoreGlobalMouseEvents()
    document.removeEventListener('mouseup', end)
    document.removeEventListener('mousemove', iterate)
    ev.stopPropagation()
    setDragged(false)
  }, [iterate])

  useEffect(() => {
    return () => {
      restoreGlobalMouseEvents();
      document.removeEventListener('mouseup', end, { capture: true })
      document.removeEventListener('mousemove', iterate, { capture: true })
    }
  }, [end, iterate])

  useEffect(() => {
    function start(ev: MouseEvent) {
      preventGlobalMouseEvents()
      document.addEventListener('mouseup', end)
      document.addEventListener('mousemove', iterate)
      ev.preventDefault()
      ev.stopPropagation()
      setDragged(true)
    }

    if (ref.current) {
      ref.current.onmousedown = start
    }
  }, [end, iterate, props.value, ref])

  const toDocumentSpace = (vec: number[]): number[] => {
    if (!ref.current) return vec
    const bbox = ref.current.getBoundingClientRect()
    return [vec[0] + bbox.left, vec[1] + bbox.top]
  }

  return {
    svgCoord,
    dragged,
    toDocumentSpace,
    ref
  }
}



import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from "recoil"
import { Box, BoxProps } from '@chakra-ui/react'
import { themed } from 'theme/theme'
import { useResizeDetector } from 'react-resize-detector'
import { projectParamInterfaceProps, projectParamsAtom } from 'core/recoil/atoms/project'
import { Vec2InterfaceCartesian, Vec2InterfaceRadial } from './interface/vec2Interface'
import { FloatInterfaceKnob } from './interface/floatInterface'


export const typeToInterface = {
  'int': ['Int Knob'],
  'float': ['Float Knob'],
  'color': ['RGB', 'HSV'],
  'vec3f': ['RGB'],
  'vec3i': ['RGB'],
  'vec2f': ['Radial', 'Cartesian'],
  'vec2i': ['Cartesian'],
}

export const interfaces: { [key: string]: ReactNode } = {
  'Radial': Vec2InterfaceRadial,
  'Cartesian': Vec2InterfaceCartesian,
  'Float Knob': FloatInterfaceKnob,
  'Int Knob': FloatInterfaceKnob
}

export type InterfaceProps = {
  paramKey: string,
  value: number[],
  onChange: (newval: number[]) => void,
  width: number,
  height: number,
}

export const ParamInterface = (props: { selectedParam: string | null } & BoxProps) => {

  const { selectedParam, ...rest } = props

  const [param, setParam] = useRecoilState(projectParamsAtom(props.selectedParam ?? ''))
  const interfaceType = typeToInterface[param.paramType][param.interface ?? 0]
  const paramInterface = param ? interfaces[interfaceType] : null
  const { width, height, ref } = useResizeDetector()

  const onHandleValueChange = (newval: number[]) => {
    setParam(old => ({ ...old, param: newval }))
  }

  return (

    <Box
      position="relative"
      ref={ref}
      style={{ aspectRatio: '1/1' }}
      bg={themed('a3')}
      flexDir="column"
      borderLeft="1px solid"
      borderColor={themed('dividerLight')}
      overflow="hidden"
      {...rest}
    >

      {
        paramInterface && props.selectedParam &&
        React.createElement(
          paramInterface,
          {
            paramKey: param.key,
            value: param.param,
            onChange: onHandleValueChange,
            width: width ? width : 0,
            height: height ? height : 0,
          }
        )
      }
    </Box>
  )
}

export const useInterfaceProps = (props: { paramKey: string }): [
  any,
  (propName: string, f: any | ((old?: any) => any)) => void,
  () => void,
] => {
  const [interfaceProps, setInterfaceProps] = useRecoilState(projectParamInterfaceProps(props.paramKey))

  const setPropValue = (propName: string, f: any | ((old?: any) => any)) => {
    setInterfaceProps((old: any) => {
      const copy = { ...old }
      copy[propName] = typeof f === 'function' ? f(old[propName]) : f
      return copy
    })
  }

  const clearProps = () => setInterfaceProps({})

  return [interfaceProps, setPropValue, clearProps]
}

export const useInterface = (
  props: InterfaceProps,
  toParamSpace: (svgCoord: number[]) => number[],
  fromParamSpace: (paramCoord: number[]) => number[],
  innerMargin?: number
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



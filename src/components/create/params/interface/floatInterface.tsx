import { Input, InputGroup, InputLeftAddon, InputLeftElement } from "@chakra-ui/react"
import { fontMono, themedRaw } from "@theme/theme"
import React, { useState } from "react"
import { InterfaceProps, useInterface, useInterfaceProps } from "../paramInterface"

export const InterfaceKnob = (props: { isInt?: boolean } & InterfaceProps) => {

  const [{ scale = 10, isNeg = true }, setPropValue, _c] = useInterfaceProps(props)

  const onToggleNegative = () => setPropValue("isNeg", old => !isNeg)
  const setScale = (scale: number) => setPropValue("scale", scale)

  const size = Math.min(props.width, props.height)
  const half = size / 2

  const toParamSpace = (svgCoord: number[]) => {
    return [svgCoord[0] - half, svgCoord[1] - half]
  }

  const fromParamSpace = (paramCoord: number[]) => {
    return paramCoord
  }

  const {
    ref
  } = useInterface(props, toParamSpace, fromParamSpace)

  const paramVal = props.value

  const bg = themedRaw('bgInterface')
  const s1 = themedRaw('s1Interface')
  const s2 = themedRaw('s2Interface')
  const text = themedRaw('textMidLight')
  const red = '#E53E3E'
  const redAlpha = '#E53E3E50'

  const knobRadius = 3 * half / 5
  const innerRadius = knobRadius + 5
  const innerRadiusOffset = Math.SQRT1_2 * innerRadius
  const outerRadius = half
  const outerRadiusOffset = Math.SQRT1_2 * outerRadius
  const shape = `
  M ${outerRadiusOffset} ${outerRadiusOffset} A ${outerRadius} ${outerRadius} 0 1 0 ${-outerRadiusOffset} ${outerRadiusOffset}
  L ${-innerRadiusOffset} ${innerRadiusOffset}
  M ${-innerRadiusOffset} ${innerRadiusOffset} A ${innerRadius} ${innerRadius} 0 1 1 ${innerRadiusOffset} ${innerRadiusOffset}
  L ${outerRadiusOffset} ${outerRadiusOffset}
  `
  //const shape = `M ${outerRadius} 0 A 1 1 0 0 0 ${-outerRadius} 0 L ${-innerRadius} 20 A 1 1 0 0 1 ${innerRadius} 0 L ${outerRadius} 0 `


  return (
    <>
      <svg width={size} height={size} viewBox={`-${half + 8} -${half + 8} ${size + 16} ${size + 16}`} ref={ref}>
        <defs>
          <clipPath id="clip">
          </clipPath>
        </defs>
        <circle cx={0} cy={0} r={knobRadius} stroke={s1} strokeWidth="1px" fill={bg} />
        <line x1={0} x2={0} y1={-knobRadius} y2={-knobRadius + 10} stroke={red} />
        <path d={shape} fill={bg} />
        <text fill={text} fontSize={size / 15 + 5} fontFamily={fontMono} >
          <tspan x={0} y={0} textAnchor="middle">{paramVal[0].toFixed(3)}</tspan>

        </text>
        <g clipPath="url(#clip)">

        </g>
      </svg>
      <InputGroup
        type="number"
        pos="absolute"
        transform="translate(-50%, 0)"
        w={half}
        h="min-content"
        left="50%"
        bottom="10px"
        fontSize={size / 30 + 5}
        fontFamily={fontMono}
      >
        <InputLeftElement minW="min-content">
          scale
        </InputLeftElement>
        <Input
          textAlign="center"
          bg="none"
        />
      </InputGroup>

    </>
  )
}

export const FloatInterfaceKnob = (props: InterfaceProps) => <InterfaceKnob {...props} />
export const IntInterfaceKnob = (props: InterfaceProps) => <InterfaceKnob {...props} isInt />
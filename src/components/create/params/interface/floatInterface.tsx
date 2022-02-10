import { Input } from "@chakra-ui/react"
import { themedRaw } from "@theme/theme"
import React, { useState } from "react"
import { InterfaceProps, useInterface } from "../paramInterface"

export const FloatInterfaceKnob = (props: InterfaceProps) => {

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

  const bg = themedRaw('bgInterface')
  const s1 = themedRaw('s1Interface')
  const s2 = themedRaw('s2Interface')
  const text = themedRaw('textMidLight')
  const red = '#E53E3E'
  const redAlpha = '#E53E3E50'

  const knobRadius = 3 * half / 5
  const innerRadius = knobRadius + 5
  const outerRadius = half
  const shape = `M ${outerRadius} 0 A 1 1 0 0 0 ${-outerRadius} 0 L ${-innerRadius} 0 A 1 1 0 0 1 ${innerRadius} 0 L ${outerRadius} 0`


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
        <g clipPath="url(#clip)">

        </g>
      </svg>
    </>
  )
}
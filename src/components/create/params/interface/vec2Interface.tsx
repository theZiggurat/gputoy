import { Portal } from "@chakra-ui/react"
import DocumentSVG from "@components/shared/misc/documentSVG"
import React, { useState, useRef, useEffect } from "react"
import { themed, themedRaw } from "theme/theme"
import { InterfaceProps, useInterface } from "../paramInterface"

export const Vec2InterfaceRadial = (props: InterfaceProps) => {

  const size = Math.min(props.width ?? 0, props.height ?? 0)
  const half = size / 2

  const toParamSpace = (svgCoord: number[]) => {
    const x = svgCoord[0] / half - 1
    const y = svgCoord[1] / half - 1
    const len = Math.sqrt(x * x + y * y)
    return [x / len, -y / len]
  }

  const fromParamSpace = (paramCoord: number[]) => {
    const svgSpace = [(paramCoord[0]) * half, -(paramCoord[1]) * half]
    return svgSpace
  }

  const {
    svgCoord,
    dragged,
    toDocumentSpace,
    ref
  } = useInterface(props, toParamSpace, fromParamSpace)

  const documentOrigin = toDocumentSpace([half + 4, half + 4])
  const windowCoord = toDocumentSpace(svgCoord)

  const bg = themedRaw('bgInterface')
  const s1 = themedRaw('s1Interface')
  const s2 = themedRaw('s2Interface')
  const text = themedRaw('textMidLight')
  const red = '#E53E3E'
  const redAlpha = '#E53E3E50'
  const offsetPos = Math.SQRT2 / 2 * half
  const offsetNeg = -Math.SQRT2 / 2 * half

  const paramVal = toParamSpace(svgCoord)
  const activeParam = fromParamSpace(paramVal)
  const angle = Math.atan2(paramVal[1], paramVal[0])

  console.log(activeParam)

  return (
    <>
      <svg width={size} height={size} viewBox={`-${half + 8} -${half + 8} ${size + 16} ${size + 16}`} ref={ref} cursor="crosshair">
        <circle cx={0} cy={0} r={half} stroke={s2} strokeWidth="1px" fill={bg} />
        <circle cx={0} cy={0} r={half / 2} stroke={s1} strokeWidth="1px" strokeDasharray="3" fill="none" />
        <circle cx={activeParam[0]} cy={activeParam[1]} r={5} fill={red} />
        <line x1={0} x2={0} y1={-half} y2={half} strokeWidth="0.5px" stroke={s1}></line>
        <line x1={-half} x2={half} y1={0} y2={0} strokeWidth="0.5px" stroke={s1}></line>
        <line x1={offsetNeg} x2={offsetPos} y1={offsetNeg} y2={offsetPos} strokeWidth="0.5px" stroke={s2}></line>
        <line x1={offsetNeg} x2={offsetPos} y1={offsetPos} y2={offsetNeg} strokeWidth="0.5px" stroke={s2}></line>
        {
          // !dragged &&
          <line x1={0} x2={activeParam[0]} y1={0} y2={activeParam[1]} strokeWidth="3px" stroke={redAlpha} strokeLinecap="round" />
        }

        <text x={half - 40} y={16} fill={text} fontSize="0.7rem" fontFamily="JetBrains Mono">
          {(angle * (180 / Math.PI)).toFixed(0)}°
        </text>
      </svg>
      {/* {
        dragged &&
        <DocumentSVG >
          <line x2={windowCoord[0] + 4} y2={windowCoord[1] + 4} x1={documentOrigin[0]} y1={documentOrigin[1]} strokeWidth="3px" stroke={redAlpha} strokeLinecap="round" />
        </DocumentSVG>
      } */}
    </>
  )
}

export const Vec2InterfaceCartesian = (props: InterfaceProps) => {

  const size = Math.min(props.width ?? 0, props.height ?? 0)
  const half = size / 2

  const toParamSpace = (svgCoord: number[]) => {
    const x = svgCoord[0] / half - 1
    const y = svgCoord[1] / half - 1
    const len = Math.sqrt(x * x + y * y)
    return [x / len, -y / len]
  }

  const fromParamSpace = (paramCoord: number[]) => {
    const svgSpace = [(paramCoord[0]) * half, -(paramCoord[1]) * half]
    return svgSpace
  }

  const {
    svgCoord,
    dragged,
    toDocumentSpace,
    ref
  } = useInterface(props, toParamSpace, fromParamSpace)

  const documentOrigin = toDocumentSpace([half + 4, half + 4])
  const windowCoord = toDocumentSpace(svgCoord)

  const bg = themedRaw('bgInterface')
  const s1 = themedRaw('s1Interface')
  const s2 = themedRaw('s2Interface')
  const text = themedRaw('textMidLight')
  const red = '#E53E3E'
  const redAlpha = '#E53E3E50'
  const offsetPos = Math.SQRT2 / 2 * half
  const offsetNeg = -Math.SQRT2 / 2 * half

  const paramVal = toParamSpace(svgCoord)
  const activeParam = fromParamSpace(paramVal)
  const angle = Math.atan2(paramVal[1], paramVal[0])

  console.log(activeParam)

  return (
    <>
      <svg width={size} height={size} viewBox={`-${half + 8} -${half + 8} ${size + 16} ${size + 16}`} ref={ref} cursor="crosshair">
        <circle cx={0} cy={0} r={half} stroke={s2} strokeWidth="1px" fill={bg} />
        <circle cx={0} cy={0} r={half / 2} stroke={s1} strokeWidth="1px" strokeDasharray="3" fill="none" />
        <circle cx={activeParam[0]} cy={activeParam[1]} r={5} fill={red} />
        <line x1={0} x2={0} y1={-half} y2={half} strokeWidth="0.5px" stroke={s1}></line>
        <line x1={-half} x2={half} y1={0} y2={0} strokeWidth="0.5px" stroke={s1}></line>
        <line x1={offsetNeg} x2={offsetPos} y1={offsetNeg} y2={offsetPos} strokeWidth="0.5px" stroke={s2}></line>
        <line x1={offsetNeg} x2={offsetPos} y1={offsetPos} y2={offsetNeg} strokeWidth="0.5px" stroke={s2}></line>
        {
          // !dragged &&
          <line x1={0} x2={activeParam[0]} y1={0} y2={activeParam[1]} strokeWidth="3px" stroke={redAlpha} strokeLinecap="round" />
        }

        <text x={half - 40} y={16} fill={text} fontSize="0.7rem" fontFamily="JetBrains Mono">
          {(angle * (180 / Math.PI)).toFixed(0)}°
        </text>
      </svg>
      {/* {
        dragged &&
        <DocumentSVG >
          <line x2={windowCoord[0] + 4} y2={windowCoord[1] + 4} x1={documentOrigin[0]} y1={documentOrigin[1]} strokeWidth="3px" stroke={redAlpha} strokeLinecap="round" />
        </DocumentSVG>
      } */}
    </>
  )
}
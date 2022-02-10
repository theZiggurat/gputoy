import { Box } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { themedRaw } from "theme/theme"
import { InterfaceProps, useInterface } from "../paramInterface"
import Checkbox from "@components/shared/checkbox"

export const Vec2InterfaceRadial = (props: InterfaceProps) => {

  const [isNorm, setIsNorm] = useState(false)

  const mag = (t: number[]) => Math.sqrt(t[0] * t[0] + t[1] * t[1])
  const normalize = (coord: number[]) => {
    const [x, y] = coord
    const len = mag(coord)
    return [len > 0 ? x / len : 0, len > 0 ? y / len : 0]
  }

  const zoom = isNorm ? 1 : Math.pow(10, props.scroll / 100_00)
  const size = props.width//Math.min(props.width ?? 0, props.height ?? 0)
  const half = size / 2

  const toParamSpace = (svgCoord: number[]) => {
    const x = (svgCoord[0] / half - 1) * zoom
    const y = -(svgCoord[1] / half - 1) * zoom
    return isNorm ? normalize([x, y]) : [x, y]
  }

  const fromParamSpace = (paramCoord: number[]) => {
    const svgSpace = [(paramCoord[0]) * half / zoom, -(paramCoord[1]) * half / zoom]
    return svgSpace
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
  const offsetPos = Math.SQRT2 / 2 * half
  const offsetNeg = -Math.SQRT2 / 2 * half

  const paramVal = props.value
  const activeParam = fromParamSpace(paramVal)
  const angle = Math.atan2(paramVal[1], paramVal[0])


  const endCoord = normalize(paramVal)
  const radius = Math.min(50, mag(paramVal) * size / 4 / zoom)
  const arcPath = `M ${radius} 0 A ${-radius} ${radius} 0 0 ${angle < 0 ? 1 : 0} ${endCoord[0] * radius} ${-endCoord[1] * radius}`

  const actRadius = Math.pow(10, Math.floor(Math.log10(zoom)))
  const line1Radius = actRadius * half / zoom
  const line2Radius = line1Radius / 2


  return (
    <>
      <svg width={size} height={size} viewBox={`-${half + 8} -${half + 8} ${size + 16} ${size + 16}`} ref={ref}>
        <defs>
          <clipPath id="clip">
            <circle cx={0} cy={0} r={half} />
          </clipPath>
        </defs>

        <g clipPath={isNorm ? "" : "url(#clip)"}>

          <circle cx={0} cy={0} r={half} stroke={s1} strokeWidth="1px" fill={bg} />
          <circle cx={0} cy={0} r={line1Radius} stroke={s2} strokeWidth="1px" fill="none" />
          <circle cx={0} cy={0} r={line2Radius} stroke={s2} strokeWidth="1px" fill="none" />
          <circle cx={0} cy={0} r={line1Radius * 10} stroke={s2} strokeWidth="1px" fill="none" />
          <circle cx={0} cy={0} r={line2Radius * 10} stroke={s2} strokeWidth="1px" fill="none" />
          <circle cx={activeParam[0]} cy={activeParam[1]} r={5} fill={red} />

          <line x1={0} x2={0} y1={-half} y2={half} strokeWidth="0.5px" stroke={s1}></line>
          <line x1={-half} x2={half} y1={0} y2={0} strokeWidth="0.5px" stroke={s1}></line>
          <line x1={offsetNeg} x2={offsetPos} y1={offsetNeg} y2={offsetPos} strokeWidth="0.5px" stroke={s2}></line>
          <line x1={offsetNeg} x2={offsetPos} y1={offsetPos} y2={offsetNeg} strokeWidth="0.5px" stroke={s2}></line>



          {
            // !dragged &&
            <line x1={0} x2={activeParam[0]} y1={0} y2={activeParam[1]} strokeWidth="3px" stroke={redAlpha} strokeLinecap="round" />
          }

          <text x={5} y={5} fill={text} fontSize="0.6em" fontFamily="JetBrains Mono">
            <tspan x={radius + 4} y={-4}>Θ: {(angle * (180 / Math.PI)).toFixed(0)}°</tspan>
            {/* <tspan x={-half + 5} y={20} dominantBaseline="hanging">x: {normalize(paramVal)[0].toFixed(2)}, y: {normalize(paramVal)[1].toFixed(2)}</tspan> */}
          </text>

          <text fill={text} fontSize="0.55em" fontFamily="JetBrains Mono">
            <tspan x={2} y={-line1Radius + 4} dominantBaseline="hanging" opacity={Math.sqrt(actRadius / zoom)}>{actRadius}</tspan>
            <tspan x={2} y={-line2Radius + 4} dominantBaseline="hanging" opacity={Math.sqrt(actRadius / 2 / zoom)}>{actRadius / 2}</tspan>
            <tspan x={2} y={-line1Radius * 10 + 4} dominantBaseline="hanging" opacity={Math.sqrt(actRadius * 10 / zoom)}>{actRadius * 10}</tspan>
            <tspan x={2} y={-line2Radius * 10 + 4} dominantBaseline="hanging" opacity={Math.sqrt(actRadius * 10 / 2 / zoom)}>{actRadius * 10 / 2}</tspan>

          </text>

          <path d={arcPath} stroke={redAlpha} fill="none" strokeWidth="2px" />
        </g>
        <text fill={text} fontSize="0.55em" fontFamily="JetBrains Mono" opacity="0.65">
          <tspan x={-half} y={half - 10}>x: {paramVal[0].toFixed(2)}</tspan>
          <tspan x={-half} y={half}>y: {paramVal[1].toFixed(2)}</tspan>
        </text>
      </svg>

      <Box position="absolute" top="0px" p="0.25rem">
        <Checkbox title="Normalize" checked={isNorm} onCheck={val => setIsNorm(val)} />
      </Box>

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

  useEffect(() => {
    console.log('constructed!')
  }, [])

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
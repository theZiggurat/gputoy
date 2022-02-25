import { Button, Flex } from "@chakra-ui/react"
import { fontMono, themed, themedRaw } from "@theme/theme"
import React, { useMemo } from "react"
import { InterfaceProps, useInterface, useInterfaceProps } from "../paramInterface"

export const InterfaceKnob = (props: { isInt?: boolean } & InterfaceProps) => {

  const fmt = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 3,
  })

  const [{ scale = 1, isNeg = true }, setPropValue, _c] = useInterfaceProps(props)

  const max = Math.pow(10, scale)
  const min = isNeg ? -max : 0


  const onToggleNegative = () => setPropValue("isNeg", old => !isNeg)
  const setScale = (scale: number) => setPropValue("scale", scale)

  const size = Math.min(props.width, props.height)
  const half = size / 2

  const toParamSpace = (svgCoord: number[]) => {
    const atan = Math.atan2(-svgCoord[0] + half, svgCoord[1] - half)
    const angle = (atan < 0 ? 2 * Math.PI + atan : atan)
    const norm = Math.min(1, Math.max(0, (angle / (2 * Math.PI) - 0.125) * 4 / 3))
    const val = min + (max - min) * norm
    console.log(val, props)
    return [props.isInt ? Math.round(val) : val]
  }

  const fromParamSpace = (paramCoord: number[]) => {
    return paramCoord
  }

  const {
    ref
  } = useInterface(props, toParamSpace, fromParamSpace)

  const paramVal = props.value[0]
  const clampedVal = Math.min(Math.max(paramVal, min), max)
  const paramAngle = (5 * Math.PI / 4) - (((clampedVal - min) / (max - min)) * 3 * Math.PI / 2)

  const bg = themedRaw('bgInterface')
  const s1 = themedRaw('s1Interface')
  const s2 = themedRaw('s2Interface')
  const text = themedRaw('textMidLight')
  const red = '#E53E3E'
  const redAlpha = '#E53E3E50'
  const ticks = 20

  const knobRadius = 3 * half / 6
  const ringInner = knobRadius + 5
  const ringInnerDiag = Math.SQRT1_2 * ringInner
  const ringOuter = half
  const ringOuterDiag = Math.SQRT1_2 * ringOuter
  const ringEdgeInner = ringOuter - 5
  const ringEdgeInnerDiag = Math.SQRT1_2 * ringEdgeInner
  const paramFactorX = Math.cos(paramAngle)
  const paramFactorY = Math.sin(paramAngle)
  const knobRingMain = useMemo(() => `
  M ${ringOuterDiag} ${ringOuterDiag} A ${ringOuter} ${ringOuter} 0 1 0 ${-ringOuterDiag} ${ringOuterDiag}
  L ${-ringInnerDiag} ${ringInnerDiag}
  M ${-ringInnerDiag} ${ringInnerDiag} A ${ringInner} ${ringInner} 0 1 1 ${ringInnerDiag} ${ringInnerDiag}
  L ${ringOuterDiag} ${ringOuterDiag}
  `, [ringInner, ringInnerDiag, ringOuter, ringOuterDiag])
  const knobRingOuter = useMemo(() => `
  M ${-ringOuterDiag} ${ringOuterDiag} A ${ringOuter} ${ringOuter} 0 ${paramAngle > Math.PI / 4 ? 0 : 1} 1 ${ringOuter * paramFactorX} ${-ringOuter * paramFactorY}
  L ${ringEdgeInner * paramFactorX} ${-ringEdgeInner * paramFactorY}
  M ${ringEdgeInner * paramFactorX} ${-ringEdgeInner * paramFactorY} A ${ringEdgeInner} ${ringEdgeInner} 1 ${paramAngle > Math.PI / 4 ? 0 : 1} 0 ${-ringEdgeInnerDiag} ${ringEdgeInnerDiag}
  L ${-ringOuterDiag} ${ringOuterDiag}
  `, [ringEdgeInner, ringEdgeInnerDiag, ringOuter, ringOuterDiag, paramAngle, paramFactorX, paramFactorY])


  return (
    <>
      <svg width={size} height={size} viewBox={`-${half + 8} -${half + 8} ${size + 16} ${size + 16}`} ref={ref}>
        <defs>
          <clipPath id="clip">
          </clipPath>
        </defs>
        <circle cx={0} cy={0} r={knobRadius} stroke={s1} strokeWidth="1px" fill={bg} />
        <line
          x1={knobRadius * Math.cos(paramAngle)}
          x2={(knobRadius - 10) * Math.cos(paramAngle)}
          y1={-knobRadius * Math.sin(paramAngle)}
          y2={-(knobRadius - 10) * Math.sin(paramAngle)}
          stroke={red}
          strokeWidth={2}
        />
        <path d={knobRingMain} fill={bg} />
        <path d={knobRingOuter} fill={redAlpha} />
        <text fill={text} fontSize={size / 15 + 5} fontFamily={fontMono} pointerEvents="none">
          <tspan x={0} y={4} textAnchor="middle">{fmt.format(paramVal)}</tspan>
        </text>
        <text fill={s1} fontSize={8} fontFamily={fontMono} pointerEvents="none">
          <tspan x={(ringOuterDiag + ringInnerDiag) / 2 + 12} y={(ringOuterDiag + ringInnerDiag) / 2} textAnchor="middle">{fmt.format(max)}</tspan>
          <tspan x={-(ringOuterDiag + ringInnerDiag) / 2 - 12} y={(ringOuterDiag + ringInnerDiag) / 2} textAnchor="middle">{fmt.format(min)}</tspan>
        </text>


        {
          Array(ticks + 1).fill(0).map((_, idx) => {
            const large = idx % 10 == 0
            const lineEnd = large ? (ringOuter + ringInner) / 2 : ringInner + (ringOuter - ringInner) / 4
            const angle = (3 * idx / (ticks * 2) - 0.25) * Math.PI
            return <line
              key={idx}
              x1={Math.cos(angle) * ringInner}
              x2={Math.cos(angle) * lineEnd}
              y1={-Math.sin(angle) * ringInner}
              y2={-Math.sin(angle) * lineEnd}
              stroke={large ? s1 : s2}
            />
          }
          )
        }
        <g clipPath="url(#clip)">

        </g>
      </svg>
      <Flex
        pos="absolute"
        bottom="0%"
        left="50%"
        transform="translate(-50%, 0)"
        color={themed("textLight")}
        fontWeight="extrabold"
        borderColor={themed("borderLight")}
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Button variant="empty" size="xs" onClick={() => setScale(Math.max(scale - 1, props.isInt ? 0 : -5))} p="0" fontWeight="bold">-</Button>
        <Button variant="empty" size="xs" p="0" color={themed("textLight")} onClick={onToggleNegative}>[{fmt.format(min)}, {fmt.format(max)}]</Button>
        <Button variant="empty" size="xs" onClick={() => setScale(Math.min(12, Math.max(scale + 1, -5)))} p="0" fontWeight="bold">+</Button>

      </Flex>

    </>
  )
}

export const FloatInterfaceKnob = (props: InterfaceProps) => <InterfaceKnob {...props} />
export const IntInterfaceKnob = (props: InterfaceProps) => <InterfaceKnob {...props} isInt />
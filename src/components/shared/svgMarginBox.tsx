import { PopoverContent } from "@chakra-ui/popover"
import React, { SVGProps, ReactNode } from "react"

type SVGMarginBoxProps = {
  size: number
  innerMargin?: number
  center?: boolean
  children: ReactNode[]
}

const _SVGMarginBox = (props: SVGMarginBoxProps & SVGProps<SVGSVGElement>, ref) => {

  const { size, innerMargin, center, children, ...svgProps } = props

  const half = size / 2
  const margin = innerMargin ?? 8

  return <svg width={size} height={size} viewBox={`-${half + margin} -${half + margin} ${size + margin * 2} ${size + margin * 2}`} ref={ref} {...svgProps}>
    {children}
  </svg>
}
const SVGMarginBox = React.forwardRef(_SVGMarginBox)

export default SVGMarginBox
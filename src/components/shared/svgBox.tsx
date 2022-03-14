import { PopoverContent } from "@chakra-ui/popover"
import { Box, BoxProps } from "@chakra-ui/react"
import React, { SVGProps, ReactNode, ReactChildren, useState } from "react"
import { useResizeDetector } from "react-resize-detector"

type SVGBoxProps = {
  center?: boolean
  onScrub?: (coord: number[], bounds: number[]) => void
  withSvg: (width: number, height: number) => ReactNode
  innerMargin?: number
}

export const SVGBox = (props: SVGBoxProps & BoxProps) => {

  const { center, onScrub, innerMargin = 0, withSvg, ...boxProps } = props
  const { width = 0, height = 0, ref } = useResizeDetector()
  const viewbox = (center ?
    [-width / 2 - innerMargin, -height / 2 - innerMargin, width + innerMargin * 2, height + innerMargin * 2] :
    [-innerMargin, -innerMargin, width + innerMargin * 2, height + innerMargin * 2]
  ).join(' ')

  const [recording, setRecording] = useState(false)
  const onHandleMouseDown = () => {
    setRecording(true)
  }
  const onHandleMouseUp = () => {
    setRecording(false)
  }
  const onHandleMouseMove = (ev) => {
    if (recording && onScrub && ref) {
      const rect = ref.current.getBoundingClientRect()
      onScrub([ev.clientX - rect.x - innerMargin, ev.clientY - rect.y - innerMargin], [width - innerMargin * 2, height - innerMargin * 2])
    }
  }
  const onHandleMouseLeave = onHandleMouseUp

  return (
    <Box
      ref={ref}
      width="100%"
      height="100%"
      {...boxProps}
    >
      <svg

        width={width}
        height={height}
        viewBox={viewbox}
        onMouseDown={onScrub ? onHandleMouseDown : undefined}
        onMouseUp={onScrub ? onHandleMouseUp : undefined}
        onMouseLeave={onScrub ? onHandleMouseLeave : undefined}
        onMouseMove={onScrub ? onHandleMouseMove : undefined}
      >
        {withSvg(width, height)}
      </svg>
    </Box>
  )
}

type SVGBoxManagedProps = {
  size: number
  innerMargin?: number
  center?: boolean
  children: ReactNode[]
}

const _SVGBoxManaged = (props: SVGBoxManagedProps & SVGProps<SVGSVGElement>, ref) => {

  const { size, innerMargin, center, children, ...svgProps } = props

  const half = size / 2
  const margin = innerMargin ?? 8

  return <svg width={size} height={size} viewBox={`-${half + margin} -${half + margin} ${size + margin * 2} ${size + margin * 2}`} ref={ref} {...svgProps}>
    {children}
  </svg>
}
export const SVGBoxManaged = React.forwardRef(_SVGBoxManaged)
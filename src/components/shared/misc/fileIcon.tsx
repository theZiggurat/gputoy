import { Extension } from "@core/types"
import { themedRaw } from "@theme/theme"
import { SVGProps } from "react"

type FileIconProps = {
  extension: Extension,
  size?: number,
}

const colorFromType = (ext: Extension): string => {
  switch (ext) {
    case 'glsl': return '#f3722c'
    case 'wgsl': return '#277da1'
    case 'json': return '#90be6d'
    case 'txt': return '#495057'
    default: return '#4d908e'
  }
}

const FileIcon = (props: FileIconProps & SVGProps<SVGSVGElement>) => {
  const { extension, size = 32, ...svgProps } = props
  return <svg width={size} height={size} version="1.1" viewBox="0 0 16.933 16.933" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
    <path
      d="m4.6982 0.26458 5.8851-5e-7 4.7625 4.7625-1e-6 10.118c0 0.84386-0.67935 1.5232-1.5232 1.5232h-9.1244c-0.84386 0-1.5232-0.67935-1.5232-1.5232v-13.358c0-0.84386 0.67935-1.5232 1.5232-1.5232z"
      fill={colorFromType(extension)} strokeWidth="0" />
    <path d="m10.583 5.0271v-4.7625l4.7625 4.7625z" fill="#1a1a1a" fillOpacity=".47552" strokeOpacity="0" />
    <rect x="2" y="8" width="13" height="8" rx="0" ry="1" fill={themedRaw('a3')} strokeWidth="0"></rect>
    <text >
      <tspan x="8" y="14" fill={themedRaw('textHigh')} fontFamily="'Segoe UI'" fontSize="7px" textAnchor="middle"
        strokeWidth=".30815">{extension}</tspan>
    </text>
  </svg>
}

export default FileIcon
export type ResourceType = 'buffer' | 'texture' | 'sampler'
export type ResourceArgs = BufferArgs | TextureArgs | SamplerArgs

export type TextureDim = '1d' | '2d' | '3d'


/**
 * Splitting texture formats into types for UX convienence. 
 * https://www.w3.org/TR/webgpu/#enumdef-gputextureformat
 */
export const TEXTURE_FORMAT_TYPES = [
  '8bit',
  '16bit',
  '32bit',
  '64bit',
  '128bit',
  'depth/stencil'
] as const
export type TextureFormatType = typeof TEXTURE_FORMAT_TYPES[number]

export const TEXTURE_FORMAT_FAMILIES: Record<TextureFormatType, readonly GPUTextureFormat[]> = {
  '8bit': [
    "r8unorm",
    "r8snorm",
    "r8uint",
    "r8sint"
  ],
  '16bit': [
    "r16uint",
    "r16sint",
    "r16float",
    "rg8unorm",
    "rg8snorm",
    "rg8uint",
    "rg8sint"
  ],
  '32bit': [
    "r32uint",
    "r32sint",
    "r32float",
    "rg16uint",
    "rg16sint",
    "rg16float",
    "rgba8unorm",
    "rgba8unorm-srgb",
    "rgba8snorm",
    "rgba8uint",
    "rgba8sint",
    "bgra8unorm",
    "bgra8unorm-srgb"
  ],
  '64bit': [
    "rg32uint",
    "rg32sint",
    "rg32float",
    "rgba16uint",
    "rgba16sint",
    "rgba16float"
  ],
  '128bit': [
    "rgba32uint",
    "rgba32sint",
    "rgba32float"
  ],
  'depth/stencil': [
    "stencil8",
    "depth16unorm",
    "depth24plus",
    "depth24plus-stencil8",
    "depth32float"
  ]
} as const

export const resourceTypeToDefaultArgs: Record<ResourceType, ResourceArgs> = {
  'buffer': {
    length: 1,
    bindingType: 'storage'
  },
  'texture': {
    dim: '2d',
    width: 1024,
    height: 1024,
    depthOrArrayLayers: 1,
    formatType: '32bit',
    format: 'bgra8unorm',
    sampleCount: 1,
    usage: 0x04
  },
  'sampler': {

  }
}


/**
 * https://www.w3.org/TR/webgpu/#dom-gpudevice-createbuffer
 */
export type BufferArgs = {
  length: number
  modelName?: string
  bindingType: GPUBufferBindingType
}

/**
 * https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture
 */
export type TextureArgs = {
  dim: TextureDim
  width: number
  height: number
  depthOrArrayLayers: number
  formatType: TextureFormatType
  format: GPUTextureFormat
  sampleCount: number
  usage: GPUTextureUsageFlags
}
/**
 * https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler
 */
export type SamplerArgs = {
  desc: GPUSamplerDescriptor
}

export interface ResourceInstance {
  label: string
  getBindGroupEntry: (binding: number) => GPUBindGroupEntry
  getBindGroupLayoutEntry: (binding: number, visibility: number) => GPUBindGroupLayoutEntry
  destroy: () => void
}

export type Resource = {
  id: string
  name: string
  type: ResourceType
  args: ResourceArgs
  frozen?: boolean
}

export type ResourceJSON = Record<string, Resource>


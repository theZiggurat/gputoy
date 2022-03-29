export type ResourceType = 'buffer' | 'texture' | 'sampler'
export type ResourceArgs = BufferArgs | TextureArgs | SamplerArgs

/**
 * https://www.w3.org/TR/webgpu/#dom-gpudevice-createbuffer
 */
export type BufferArgs = {
  length: number
  modelName: string
  bindingType: GPUBufferBindingType
}

/**
 * https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture
 */
export type TextureArgs = {
  dim: '1d' | '2d' | '3d'
  width: number
  height: number
  depthOrArrayLayers: number
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


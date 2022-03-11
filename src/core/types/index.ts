import { Logger } from "@core/recoil/atoms/console"


export * from './shaderTypes'
export * from './fileTypes'
export * from './ioTypes'
export * from './graphTypes'
export * from './prismaTypes'
export * from './pipelineTypes'

export type FileId = string
export type ChannelId = string
export type ChannelNodeId = string

export type GPUInitResult = 'ok' | 'error' | 'incompatible' | 'uninitialized'

export type AttachResult = {
  canvas: HTMLCanvasElement,
  canvasContext: GPUCanvasContext,
  targetTexture: GPUTexture,
  presentationSize: number[],
  preferredFormat: GPUTextureFormat,
}

/**
 * Current status of project
 */
export type ProjectStatus = {
  lastStartTime: number
  lastFrameRendered: number
  dt: number
  frameNum: number
  runDuration: number
  prevDuration: number
  running: boolean
}

export interface Resource {
  label: string
  getBindGroupEntry: (binding: number) => GPUBindGroupEntry
  getBindGroupLayoutEntry: (binding: number, visibility: number) => GPUBindGroupLayoutEntry
  destroy: () => void
}

/**
 * Misc project types
 */
export type MousePos = {
  x: number,
  y: number
}

export type Resolution = {
  width: number,
  height: number,
}
export type Author = {
  id: string,
  name: string | null,
  image: string | null
}

/**
 *  Layout types
 */
export type Locator = 'last-select' | 'depth' | 'depth-inv'
export type Task = {
  sourceId: string,
  message: string,
  targetId?: string,
  targetPanelIndex?: number
  locateBy?: Locator
  args?: any
}

export type InstanceSelector = {
  id: string,
  index?: number
}

export type EditorLayout = {
  layout: any,
  instances: { [key: string]: InstanceState & { index?: number } }
}

export type InstanceState = any

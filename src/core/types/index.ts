import { Logger } from "@core/recoil/atoms/console"
import { Namespace, ValidationResult } from "./shaderTypes"

export * from './shaderTypes'
export * from './fileTypes'
export * from './ioTypes'
export * from './graphTypes'
export * from './prismaTypes'
export * from './pipelineTypes'
export * from './resourceTypes'

export type SystemValidationState = 'unvalidated' | 'validating' | 'validated' | 'failed'
export type SystemBuildState = 'unbuilt' | 'building' | 'built' | 'failed'

export type SystemFrameState = {
  lastStartTime: number
  lastFrameRendered: number
  dt: number
  frameNum: number
  runDuration: number
  prevDuration: number
  running: boolean
}

export type SystemPrebuildResult = {
  namespace: Record<string, Namespace>,
  validations: Record<string, ValidationResult>
}

export const defaultFrameState = {
  lastStartTime: 0,
  lastFrameRendered: 0,
  dt: 0,
  frameNum: 0,
  runDuration: 0,
  prevDuration: 0,
  running: false,
}

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

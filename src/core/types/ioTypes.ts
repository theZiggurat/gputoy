import { Resource, Model, Namespace } from "."
import { Logger } from "@core/recoil/atoms/console"

export type IOType = 'viewport' | 'mouse' | 'keyboard' | 'file'
export type IOArgs = ViewportIOArgs | MouseIOArgs | KeyboardIOArgs | FileIOArgs | StateIOArgs

export type ViewportIOArgs = {
  canvasId: string
}

export type MouseIOArgs = {
  eventTargetId: string
}

export type KeyboardIOArgs = {

}

export type FileIOArgs = {
  fileId: string,

}

export type StateIOArgs = {

}
export type StateIOMessage = StateIOArgs
/**
 * Holds serializable info about an IO channel
 * These will be created when a component in the react tree
 * uses useIOChannel
 */
export type IOChannel = {
  id: string
  label: string
  ioType: IOType,
  args: IOArgs
}

/**
 * Handles the io during runtime
 * Created on build from IOSync objects obtained from recoil values
 */
export interface IO {
  label: string
  type: IOType
  usage: 'read' | 'write' | 'readwrite'
  build: (args: IOArgs, label: string, logger?: Logger) => Promise<boolean>
  destroy: (logger?: Logger) => void
  onBeginDispatch: (queue: GPUQueue) => void
  onEndDispatch: (queue: GPUQueue) => void
  getNamespace: () => Namespace
  getResource: () => Resource
}

export type IOConnectorType = 'viewport' | 'file' | 'key' | 'mouse'
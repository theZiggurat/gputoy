import { Logger } from "@core/recoil/atoms/console"
import { AttachResult } from "./gpu"
import GPU from '@core/system/gpu'

type PassCommandEncoder = (
  commandEncoder: GPUCommandEncoder,
  pipelineState: any,
  attachment: AttachResult,
  logger?: Logger
) => void

abstract class Pass {
  private label?: string
  abstract isBuilt: () => boolean
  protected build = (pass: any, logger?: Logger): boolean => {
    this.label = pass['label']
    const isBuilt = this._build(pass, logger)
    return isBuilt
  }
  abstract _build: (pass: any, logger?: Logger) => boolean
  abstract encodeCommands: PassCommandEncoder
  getEncoder: () => PassCommandEncoder | undefined = () => {
    return this.isBuilt() ? this.encodeCommands : undefined
  }
  getLabel = (): string => { return this.label ?? "unknown" }
}

class RenderPass extends Pass {

  private pipeline!: GPURenderPipeline
  private pipelineLayout!: GPUPipelineLayout



  isBuilt = () => {
    return !this.pipeline || !this.pipelineLayout
  }

  build = (pass: any, logger?: Logger | undefined): boolean => {
    super.build(pass, logger)
    return false
  }

  private _encodeCommands = (
    commandEncoder: GPUCommandEncoder,
    pipelineState: any,
    attachment: AttachResult,
    logger?: Logger
  ) => {

  }
}

class ComputePass extends Pass {

  private pipeline!: GPUComputePipeline
  private pipelineLayout!: GPUPipelineLayout

  isBuilt = () => {
    return !this.pipeline || !this.pipelineLayout
  }

  build = (pipeline: any, logger?: Logger | undefined): boolean => {

    GPU.device.pushErrorScope('validation')

    return false
  }

  encodeCommands = (
    commandEncoder: GPUCommandEncoder,
    pipelineState: any,
    _attachment: AttachResult,
    logger?: Logger
  ) => {

    const pass = commandEncoder.beginComputePass()
    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, decayBindGroups[frameNum % 2])
    pass.dispatch(screenWorkGroupCount[0], screenWorkGroupCount[1])
    pass.endPass()


  }
}
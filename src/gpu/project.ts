import { Logger } from '../recoil/console'

import Compiler from './compiler'
import * as types from './types'
import GPU from './gpu'
import Params from './params'
import staticdecl from './staticdecl'

export class Project {

  static _instance: Project

  static instance = (): Project => {
    if (Project._instance === undefined) 
      Project._instance = new Project()
    return Project._instance
  }

  // project state
  included: Params = new Params('Included', 'i', true)
  params: Params = new Params('Params', 'p', false, 1)
  shaders: types.CodeFile[] = []

  // gpu state
  vertexBuffer!: GPUBuffer
  shaderModule!: GPUShaderModule

  pipeline!: GPURenderPipeline
  pipelineLayout!: GPUPipelineLayout

  // needs update
  shaderDirty = true

  // attaches canvas to current GPU device if there is one
  // if there is no device, it will try to init
  // if browser is incompatable, it will return
  attachCanvas = async (canvasId: string, logger: Logger): Promise<boolean> => {
    return await GPU.attachCanvas(canvasId, logger)
  }

  // starts project
  prepareRun = (state: types.ProjectStatus, logger: Logger): boolean => {
    if(!GPU.isInitialized()){
      logger.err('Project', 'GPU not initialized. Cancelling run')
      return false
    }

    // project is starting or restarted
    if (state.frameNum == 0 || this.shaderDirty) {
      logger.trace('Project', 'Preparing run')
      if (this.shaderDirty) {
        if (!Compiler.isReady()) {
          logger.err('Compiler', 'Compiler module not ready')
          return false
        }
        if (!this.compileShaders(logger)) {
          //logger.err('Project', 'Shader compilation failed')
          return false
        }
        this.shaderDirty = false
      }
      logger.trace('Project', 'Creating Pipeline..')
      this.mapBuffers()
      this.createPipeline()
      logger.trace('Project', 'Ready')
    }
    return true
  }

  renderFrame = () => {
    this.encodeCommands()
  }

  updateDefaultParams = (paramDesc: types.ParamDesc[], logger: Logger) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.included.set(paramDesc, GPU.device) || this.shaderDirty
  }

  updateParams = (paramDesc: types.ParamDesc[], logger: Logger) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.params.set(paramDesc, GPU.device) || this.shaderDirty
  }

  updateShaders = (files: types.CodeFile[], logger: Logger) => {
    this.shaders = files
    this.shaderDirty = true
  }

  compileShaders = (logger: Logger): boolean => {
    let src = this.shaders.find(f => f.isRender)
    if (src === undefined) {
      logger.err('Project', 'Cannot compile. No \'render\' shader in files!')
      return false
    }
    let shader = this.included.getShaderDecl()
      .concat(staticdecl.vertex)
      .concat(this.params.getShaderDecl())
      .concat(src!.file)

      //console.log(shader)
    let module = Compiler.compileWGSL!(GPU.device, shader, logger)
    if (!module)
      return false
    this.shaderModule = module
    return true
  }

  // buffer initialization called on run()
  mapBuffers = () => {
    if (!GPU.isInitialized())
      return
    
    const vertexBufferData = new Float32Array([-1.0, -1.0, 1.0, -1.0, 1.0, 
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0]);
    this.vertexBuffer = GPU.device.createBuffer({
        label: "_vertex",
        size: vertexBufferData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    GPU.device.queue.writeBuffer(
      this.vertexBuffer,
      0,
      vertexBufferData.buffer,
      vertexBufferData.byteOffset,
      vertexBufferData.byteLength
    );
  }

  createPipeline = () => {
    if (!GPU.isInitialized())
      return

    if (!this.shaderModule)
      return

    let layouts = [this.included.getBindGroupLayout()]
    if(!this.params.isEmpty())
      layouts.push(this.params.getBindGroupLayout())

    this.pipelineLayout = GPU.device.createPipelineLayout({
      bindGroupLayouts: layouts
    })

    this.pipeline = GPU.device.createRenderPipeline({
      layout: this.pipelineLayout,
      vertex: {
        module: this.shaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 2 * 4,
            stepMode: "vertex",
            attributes: [{
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2'
            }],
          }
        ]
      },
      fragment: {
        module: this.shaderModule,
        entryPoint: "main",
        targets: [
          {
            format: GPU.preferredFormat,
          }
        ]
      },
      primitive: {
        topology: "triangle-list"
      }
    })
    
  }

  encodeCommands = () => {
    if (!GPU.isInitialized())
      return

    GPU.targetTexture = GPU.canvasContext.getCurrentTexture()
    const targetTextureView = GPU.targetTexture.createView()

    const renderPassDesc: GPURenderPassDescriptor = {
      label: "render",
      colorAttachments: [{
          view: targetTextureView,
          loadValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: 'store'
      }],
    }

    const commandEncoder = GPU.device.createCommandEncoder()
    const rpass = commandEncoder.beginRenderPass(renderPassDesc)
    rpass.setPipeline(this.pipeline)
    rpass.setVertexBuffer(0, this.vertexBuffer)
    rpass.setBindGroup(0, this.included.getBindGroup())
    if(!this.params.isEmpty())
      rpass.setBindGroup(1, this.params.getBindGroup())
    rpass.draw(6, 1, 0, 0)
    rpass.endPass()

    GPU.device.queue.submit([commandEncoder.finish()])
  }
}

const WorkingProject = new Project()
export default WorkingProject;
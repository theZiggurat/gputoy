import { Logger } from 'core/recoil/atoms/console'
import { FileErrors } from 'core/recoil/atoms/project'
import { SetterOrUpdater } from 'recoil'
import Compiler from './compiler'
import GPU, { AttachResult } from './gpu'
import Params from './params'
import staticdecl from './staticdecl'
import * as types from '@core/types'


export class Project {

  static _instance: Project

  static instance = (): Project => {
    if (Project._instance === undefined) {
      Project._instance = new Project()
    }

    return Project._instance
  }

  included: Params = new Params('Included', 'i', true)
  params: Params = new Params('Params', 'p', false, 1)


  vertexBuffer!: GPUBuffer
  shaderModule!: GPUShaderModule

  shaderDirty = true

  gpuAttach!: AttachResult
  resizeNeeded: boolean = false
  resizeSize: number[] = [0, 0]


  files: Record<string, types.File> = {}
  resources: Record<string, types.Resource> = {}

  destroy() {

  }

  buildResources = async () => {

  }

  // attaches canvas to current GPU device if there is one
  // if there is no device, it will try to init
  // if browser is incompatable, it will return
  attachCanvas = async (canvasId: string, logger?: Logger): Promise<boolean> => {
    const result = await GPU.attachCanvas(canvasId, logger)
    if (result == null) return false
    this.gpuAttach = result
    return true
  }

  handleResize = (newsize: number[]) => {
    if (this.gpuAttach === undefined) return
    if (
      newsize[0] !== this.gpuAttach.presentationSize[0] ||
      newsize[1] !== this.gpuAttach.presentationSize[1]
    ) {
      this.resizeNeeded = true
      this.resizeSize = newsize
    }
  }

  build = async (): Promise<boolean> => { return false }

  prepareRun = async (state: types.ProjectStatus, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): Promise<boolean> => {
    if (!GPU.isInitialized()) {
      logger?.err('Project', 'GPU not initialized. Cancelling run')
      return false
    }

    if (this.resizeNeeded) {
      this.gpuAttach = GPU.handleResize(this.gpuAttach, this.resizeSize)
      this.resizeNeeded = false
    }

    // project is starting or restarted
    if (state.frameNum == 0 || this.shaderDirty) {
      //logger?.trace('Project', 'Preparing run')

      if (this.shaderDirty) {
        if (!Compiler.instance().isReady()) {
          logger?.err('Compiler', 'Compiler module not ready')
          return false
        }
        const continueRun = await this.compileShaders(logger, setFileErrors)
        if (!continueRun) {
          return false
        }
        this.shaderDirty = false
      }
      //logger?.trace('Project', 'Creating Pipeline..')
      this.mapBuffers()
      this.createPipeline()
      //logger?.trace('Project', 'Ready')
    }
    return true
  }

  renderFrame = () => {
    this.encodeCommands()
  }

  updateDefaultParams = (paramDesc: types.ParamDesc[], logger?: Logger) => {
    if (GPU.isInitialized())
      this.shaderDirty = this.included.set(paramDesc, GPU.device) || this.shaderDirty
  }

  updateParams = (paramDesc: types.ParamDesc[], logger?: Logger) => {
    if (GPU.isInitialized())
      this.shaderDirty = this.params.set(paramDesc, GPU.device, logger) || this.shaderDirty
  }

  updateShaders = (files: { [key: string]: types.File }, logger?: Logger) => {
    this.files = files
    this.shaderDirty = true
  }

  graph = {

  }

  compileShaders = async (logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): Promise<boolean> => {
    let [first, second, third] = Object.values(this.files).filter(f => types.isShader(f.extension))

    Compiler.instance().compile(GPU.device, first, "", {}, logger)

    return false
    // console.log(shaderFile)
    // const extension = shaderFile.extension
    // if (shaderFile === undefined) {
    //   logger?.err('Project', 'Cannot compile. No \'render\' shader in files!')
    //   return false
    // }
    // let decls = this.included.getShaderDecl(extension)
    //   .concat(this.params.getShaderDecl(extension))

    // let module = null
    // if (extension == 'wgsl')
    //   module = await Compiler.instance().compile(GPU.device, shaderFile, logger)
    // else
    //   module = await Compiler.instance().compile(GPU.device, shaderFile, decls, logger, setFileErrors)
    // if (module == null)
    //   return false
    // this.shaderModule = module
    // return true
  }

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
    if (!this.params.isEmpty())
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
            format: this.gpuAttach.preferredFormat,
          }
        ]
      },
      primitive: {
        topology: "triangle-list"
      }
    })

  }

  encodeCommands = () => {
    if (!GPU.isInitialized() || !this.pipeline)
      return

    this.gpuAttach.targetTexture = this.gpuAttach.canvasContext.getCurrentTexture()
    const targetTextureView = this.gpuAttach.targetTexture.createView()

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
    if (!this.params.isEmpty())
      rpass.setBindGroup(1, this.params.getBindGroup())
    rpass.draw(6, 1, 0, 0)
    rpass.endPass()

    GPU.device.queue.submit([commandEncoder.finish()])
  }
}
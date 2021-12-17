import { Logger } from '../recoil/console'

import Compiler from './compiler'
import * as types from './types'
import GPU, { AttachResult } from './gpu'
import Params from './params'
import staticdecl from './staticdecl'
import { SetterOrUpdater } from 'recoil'
import { FileErrors } from '../recoil/project'
import { Project as DBProject } from '.prisma/client'

export class Project {

  static _instance: Project

  static instance = (): Project => {
    if (Project._instance === undefined) {
      console.log('making new instance')
      Project._instance = new Project()
    }
      
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

  gpuAttach!: AttachResult
  resizeNeeded: boolean = false
  resizeSize: number[] = [0, 0]

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
      //this.gpuAttach = GPU.handleResize(this.gpuAttach, newsize)
    }
  }

  // starts project
  prepareRun = (state: types.ProjectStatus, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): boolean => {
    if(!GPU.isInitialized()){
      logger?.err('Project', 'GPU not initialized. Cancelling run')
      return false
    }

    if (this.resizeNeeded) {
      this.gpuAttach = GPU.handleResize(this.gpuAttach, this.resizeSize)
      this.resizeNeeded = false
    }

    // project is starting or restarted
    if (state.frameNum == 0 || this.shaderDirty) {
      logger?.trace('Project', 'Preparing run')

      if (this.shaderDirty) {
        if (!Compiler.instance().isReady()) {
          logger?.err('Compiler', 'Compiler module not ready')
          return false
        }
        if (!this.compileShaders(logger, setFileErrors)) {
          return false
        }
        this.shaderDirty = false
      }
      logger?.trace('Project', 'Creating Pipeline..')
      this.mapBuffers()
      this.createPipeline()
      logger?.trace('Project', 'Ready')
    }
    return true
  }

  renderFrame = () => {
    this.encodeCommands()
  }

  renderPreview = async (project: DBProject) => {
    while(!Compiler.instance().isReady()) {
      console.log('compiler not ready yet')
      await sleep(50)
    }
    
    if(!GPU.isInitialized() || !project || !project.shaders)
      return

    if (this.included.isEmpty()) {
      this.included.set([
        {paramName: 'time', paramType: 'float', param: [0]},
        {paramName: 'dt',   paramType: 'float', param: [0]},
        {paramName: 'frame', paramType: 'int', param: [0]},
        {paramName: 'mouseNorm', paramType: 'vec2f', param: [0.5, 0.5]},
        {paramName: 'aspectRatio', paramType: 'float', param: [1]},
        {paramName: 'res', paramType: 'vec2i', param: [300, 300]},
        {paramName: 'mouse', paramType: 'vec2i', param: [150, 150]},
      ], GPU.device)
    }

    if (project.params)
      this.updateParams(JSON.parse(project.params))
    
    const shdrs = project.shaders.map(s => {
      return {
        filename: s.name,
        file: s.source,
        lang: s.lang,
        isRender: s.isRender,
      }
    })

    this.shaders = shdrs
    this.compileShaders()
    this.mapBuffers()
    this.createPipeline()
    this.encodeCommands()
    
    return this.gpuAttach.canvas.toDataURL('image/png')
  }

  updateDefaultParams = (paramDesc: types.ParamDesc[], logger?: Logger) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.included.set(paramDesc, GPU.device) || this.shaderDirty
  }

  updateParams = (paramDesc: types.ParamDesc[], logger?: Logger) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.params.set(paramDesc, GPU.device) || this.shaderDirty
    //console.log(this.shaderDirty)
  }

  updateShaders = (files: types.CodeFile[], logger?: Logger) => {
    this.shaders = files
    this.shaderDirty = true
  }

  compileShaders = (logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): boolean => {
    //console.log(this.shaders)
    let srcFile = this.shaders.find(f => f.isRender)
    if (srcFile === undefined) {
      logger?.err('Project', 'Cannot compile. No \'render\' shader in files!')
      return false
    }
    let decls = this.included.getShaderDecl()
      .concat(staticdecl.vertex)
      .concat(this.params.getShaderDecl())

    let module = Compiler.instance().compileWGSL!(GPU.device, srcFile, decls, logger, setFileErrors)
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
    if(!this.params.isEmpty())
      rpass.setBindGroup(1, this.params.getBindGroup())
    rpass.draw(6, 1, 0, 0)
    rpass.endPass()

    GPU.device.queue.submit([commandEncoder.finish()])
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WorkingProject = new Project()
export default WorkingProject;
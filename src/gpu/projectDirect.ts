import { Project as DBProject } from ".prisma/client"
import * as types from './types'
import GPU, { AttachResult } from './gpu'
import Params from "./params"
import staticdecl from './staticdecl'
import Compiler from './compiler'

class ProjectDirect {

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

  constructor() {}

  init = async (project: DBProject) => {

    const result = await GPU.attachCanvas(project.id)
    if (result == null) return
    this.gpuAttach = result

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

    while(!Compiler.instance().isReady()) {
      console.log('compiler not ready yet')
      await sleep(50)
    }
    this.shaders = shdrs
    this.compileShaders()
    this.mapBuffers()
    this.createPipeline()
    this.renderFrame()
  }

  updateParams = (paramDesc: types.ParamDesc[]) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.params.set(paramDesc, GPU.device) || this.shaderDirty
    //console.log(this.shaderDirty)
  }

  updateShaders = (files: types.CodeFile[]) => {
    this.shaders = files
    this.shaderDirty = true
  }

  updateDefaultParams = (paramDesc: types.ParamDesc[]) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.included.set(paramDesc, GPU.device) || this.shaderDirty
  }

  compileShaders = (): boolean => {
    //console.log(this.shaders)
    let srcFile = this.shaders.find(f => f.isRender)
    if (srcFile === undefined) {
      return false
    }
    let decls = this.included.getShaderDecl()
      .concat(staticdecl.vertex)
      .concat(this.params.getShaderDecl())

    let module = Compiler.instance().compileWGSL!(GPU.device, srcFile, decls)
    if (!module)
      return false
    this.shaderModule = module
    return true
  }

  renderFrame = () => {
    this.encodeCommands()
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

export default ProjectDirect
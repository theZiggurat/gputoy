import {ParamDesc, ParamType} from './params'
import GPU from './gpu'

interface ProjcetSerializable {

}

class Project {

  // run state
  lastStartTime: number = 0
  lastFrameRendered: number = 0
  dt: number = 0
  frameNum: number = 0
  runDuration: number = 0
  prevDuration: number = 0
  running: boolean = false

  // project state
  uniforms: ParamDesc[] = []

  status: string = 'Ok'

  vertexBuffer!: GPUBuffer
  shaderModule!: GPUShaderModule

  bindGroupLayout!: GPUBindGroupLayout
  bindGroup!: GPUBindGroup

  pipeline!: GPURenderPipeline
  pipelineLayout!: GPUPipelineLayout

  shaderSrc: string = ""

  //render: (() => void) = () => {}
  
  constructor() {
  }

  // attaches canvas to current GPU device if there is one
  // if there is no device, it will try to init
  // if browser is incompatable, it will return
  attachCanvas = async (canvasId: string) => {

    // if gpu is not initialized
    // keep trying unless browser is incompatible
    while (!GPU.isInitialized()) {
      this.status = 'Initializing'
      let status = await GPU.init()
      if (status === 'incompatible') {
        this.status = 'Browser Incompatible'
        return
      }
    }

    let status = GPU.attachCanvas(canvasId)
    this.status = status

    GPU.device.onuncapturederror = (ev: GPUUncapturedErrorEvent) => {
      let message:string = ev.error.message
      if (message.startsWith('Tint WGSL reader failure')) {
        console.log(ev)
      }
      
    }
  }

  // starts project
  run = () => {
    if (!(this.render) || this.running || !GPU.isInitialized()) return

    if (this.frameNum == 0) {
      console.log('doing stuff')
      this.mapBuffers()
      this.compileShaders()
      this.createBindGroupLayout()
      this.createPipeline()
      this.createBindGroups()
    }
      


    this.lastStartTime = performance.now()

    this.running = true
    this.status = 'Running'
    this.renderInternal()
  }

  // runs external render and does record-keeping
  renderInternal = () => {
    if (!this.running) return
    
    this.render()
    let now = performance.now()
    this.dt = now - this.lastFrameRendered
    this.lastFrameRendered = now
    this.runDuration = (now - this.lastStartTime) / 1000 + this.prevDuration
    ++this.frameNum

    window.requestAnimationFrame(this.renderInternal)
  }

  // stops render loop without restarting
  pause = () => {
    if (!GPU.isInitialized())
      return
    this.status = 'Paused'
    this.running = false
    this.prevDuration = this.runDuration
  }

  // stops render loop with restarting
  stop = () => {
    if (!GPU.isInitialized())
      return
    this.status = 'Ok'
    this.running = false
    this.frameNum = 0
    this.runDuration = 0
  }

  // called when project run() or values are updated in GUI
  updateUniforms = (params: ParamDesc[]) => {
    if (!GPU.isInitialized())
      return

    this.uniforms.splice(0, this.uniforms.length, ...params)
  }

  // buffer initialization called on run()
  mapBuffers = () => {
    if (!GPU.isInitialized())
      return
    
    const vertexBufferData = new Float32Array([-1.0, -1.0, 1.0, -1.0, 1.0, 
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0]);
    this.vertexBuffer = GPU.device.createBuffer({
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

  compileShaders = () => {
    this.shaderModule = GPU.device.createShaderModule({
      code: this.shaderSrc
    })
  }

  createBindGroupLayout = () => {
    if (!GPU.isInitialized())
      return
    
    this.bindGroupLayout = GPU.device.createBindGroupLayout({
      entries: [
        
      ]
    })
  }

  createPipeline = () => {
    if (!GPU.isInitialized())
      return

    this.pipelineLayout = GPU.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout]
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
          entryPoint: "fs_main",
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

  createBindGroups = () => {
    if (!GPU.isInitialized())
      return
    
    this.bindGroup = GPU.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: []
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
    rpass.setBindGroup(0, this.bindGroup)
    rpass.draw(6, 1, 0, 0)
    rpass.endPass()

    GPU.device.queue.submit([commandEncoder.finish()])
  }

  render = () => {
    this.encodeCommands()
  }

}

const WorkingProject = new Project()
export default WorkingProject;
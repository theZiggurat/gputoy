import {ParamDesc, ParamType} from './params'
import GPU from './gpu'
import Console from './console'

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

  canvas!: HTMLCanvasElement
  mousePos: [number, number] = [0, 0]

  // project state
  uniforms: ParamDesc[] = []
  status: string = 'Ok'

  // gpu state
  vertexBuffer!: GPUBuffer
  shaderModule!: GPUShaderModule

  bindGroupLayout!: GPUBindGroupLayout
  bindGroup!: GPUBindGroup

  pipeline!: GPURenderPipeline
  pipelineLayout!: GPUPipelineLayout


  defaultDecl = `[[block]]
  struct DefaultUniformsF {
      time: f32;
      dt: f32;
      mouse: vec2<f32>;
  };
  
  [[block]]
  struct DefaultUniformsI {
      resolution: vec2<i32>;
      frame: i32;
      mouse: vec2<i32>;
  };
  
  [[group(0), binding(0)]] var<uniform> f : DefaultUniformsF;
  [[group(0), binding(1)]] var<uniform> i : DefaultUniformsI;`

  defaultBindGroupLayout!: GPUBindGroupLayout
  defaultBindGroup!: GPUBindGroup

  defaultFBuffer!: GPUBuffer
  defaultIBuffer!: GPUBuffer
  

  shaderSrc: string = ""

  // needs update
  dirty = true
  
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

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if(this.canvas) 
      this.canvas.addEventListener('mousemove', evt => {
        let rect = this.canvas.getBoundingClientRect()
        this.mousePos = [
          evt.clientX - rect.left,
          evt.clientY - rect.top
        ]
      }, false);

    GPU.device.onuncapturederror = this.errorHandler
  }

  // starts project
  run = () => {
    if (!(this.render) || this.running || !GPU.isInitialized()) 
      return

    if (this.dirty) 
      this.compile()

    this.lastStartTime = performance.now()

    this.running = true
    this.status = 'Running'
    this.renderInternal()
  }

  // runs external render and does record-keeping
  renderInternal = () => {
    if (!this.running) return
    
    let now = performance.now()
    this.dt = now - this.lastFrameRendered
    this.lastFrameRendered = now
    this.runDuration = (now - this.lastStartTime) / 1000 + this.prevDuration
    ++this.frameNum

    this.updateDefaultParams()
    this.render()

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
    
    this.dirty = true
    this.status = 'Ok'
    this.running = false
    this.frameNum = 0
    this.runDuration = 0
  }

  halt = () => {
    this.stop()
    this.dt = 0
    this.status = "Error"
  }

  compile() {
    this.createDefaults()

    this.mapBuffers()
    this.compileShaders()
    this.createBindGroupLayout()
    this.createPipeline()
    this.createBindGroups()
    this.dirty = false
  }

  createDefaults = () => {
    this.defaultBindGroupLayout = GPU.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {
            type: 'uniform'
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {
            type: 'uniform'
          }
        },
      ]
    })

    this.defaultFBuffer = GPU.device.createBuffer({
      size: 4 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    this.defaultIBuffer = GPU.device.createBuffer({
      size: 5 * 4,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    this.defaultBindGroup = GPU.device.createBindGroup({
      layout: this.defaultBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.defaultFBuffer }
        },
        {
          binding: 1,
          resource: { buffer: this.defaultIBuffer }
        }
      ]
    })
  }

  updateDefaultParams = () => {

    let rect = this.canvas.getBoundingClientRect()

    let fbuf = new Float32Array([
      this.runDuration, //time
      this.dt,          //dt
      this.mousePos[0], //mousex
      this.mousePos[1], //mousey
    ])
    GPU.device.queue.writeBuffer(
      this.defaultFBuffer,
      0,
      fbuf.buffer,
      fbuf.byteOffset,
      fbuf.byteLength
    )

    let ibuf = new Int32Array([
      rect.width,       //resX
      rect.height,      //resY,
      this.frameNum,    //frame
      this.mousePos[0], //mousex
      this.mousePos[1], //mouseY
    ])

    GPU.device.queue.writeBuffer(
      this.defaultIBuffer,
      0,
      ibuf.buffer,
      ibuf.byteOffset,
      ibuf.byteLength
    )
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
    //Console.trace("Creating shader", "example.wgsl")
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
      bindGroupLayouts: [this.defaultBindGroupLayout, this.bindGroupLayout]
    })

    //GPU.device.pushErrorScope('validation')
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
    //GPU.device.popErrorScope().then(error => console.log(error))
    
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
    rpass.setBindGroup(0, this.defaultBindGroup)
    rpass.setBindGroup(1, this.bindGroup)
    rpass.draw(6, 1, 0, 0)
    rpass.endPass()

    GPU.device.queue.submit([commandEncoder.finish()])
  }

  render = () => {
    this.encodeCommands()
  }

  errorHandler = (ev: GPUUncapturedErrorEvent) => {
    let message: string = ev.error.message

    // shader error
    if (message.startsWith('Tint WGSL reader failure')) {
      
      let start = message.indexOf(':')+1
      let body = message.substr(start, message.indexOf('Shader')-start).trim()
      Console.err("Shader error", body)
    }
    else if (message.startsWith('[ShaderModule] is an error.')) {
      Console.err("Shader module", message)
    }
    else {
      Console.err("Unknown error", message)
      
    }
    this.halt()
  }

  onStart: () => void = () => {}
  onPause: () => void = () => {}
  onStop: () => void = () => {}
  onHalt: () => void = () => {}

  setShaderSrc = (src: string) => {
    this.shaderSrc = this.defaultDecl.concat(src)
    this.dirty = true
  }

}

const WorkingProject = new Project()
export default WorkingProject;
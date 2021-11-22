import Params, {ParamDesc, ParamType} from './params'
import GPU from './gpu'
import { Logger } from '../recoil/console'
import Compiler from './compiler'

export class Project {

  static _instance: Project

  static instance = (): Project => {
    if (Project._instance === undefined) 
      Project._instance = new Project()
    return Project._instance
  }



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
  included: Params = new Params('Included', 'i', true)
  params: Params = new Params('Params', 'p', false, 1)

  status: string = 'Ok'

  // gpu state
  vertexBuffer!: GPUBuffer
  shaderModule!: GPUShaderModule

  pipeline!: GPURenderPipeline
  pipelineLayout!: GPUPipelineLayout

  vertexDecl = `struct VertexOutput {
    [[builtin(position)]] position: vec4<f32>;
    [[location(1)]] uv: vec2<f32>;
  };

  [[stage(vertex)]]
  fn vs_main(
      [[location(0)]] position: vec2<f32>,
  ) -> VertexOutput {
      var out: VertexOutput;
      out.position = vec4<f32>(position, 0.0, 1.0);
      out.uv = (position + vec2<f32>(1.0)) / 2.0;
      return out;
  }
`

  userSrc:  string = ""
  shaderSrc: string = ""

  // needs update
  shaderDirty = true
  uniformsDirty = true

  // attaches canvas to current GPU device if there is one
  // if there is no device, it will try to init
  // if browser is incompatable, it will return
  attachCanvas = async (canvasId: string, logger: Logger): Promise<boolean> => {

    // if gpu is not initialized
    // keep trying unless browser is incompatible
    while (!GPU.isInitialized()) {
      this.status = 'Initializing'
      let status = await GPU.init(logger)
      if (status === 'incompatible') {
        this.status = 'Browser Incompatible'
        logger.fatal('Error', 'Browser Incompatable. Try https://caniuse.com/webgpu to find browsers compatible with WebGPU')
        return false
      }
    }

    let status = GPU.attachCanvas(canvasId, logger)
    this.status = status

    // wont need this soon
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    // if(this.canvas) 
    //   this.canvas.addEventListener('mousemove', evt => {
    //     let rect = this.canvas.getBoundingClientRect()
    //     this.mousePos = [
    //       evt.clientX - rect.left,
    //       evt.clientY - rect.top
    //     ]
    //   }, false);

    logger.trace('Viewport', 'Attached canvas')

    return true
  }

  // starts project
  prepareRun = (logger: Logger) => {
    if (this.running) {
      logger.err('Project', 'Already running')
    }

    if(!GPU.isInitialized()){
      logger.err('Project', 'GPU not initialized. Cancelling run')
      return
    }

    logger.trace('Project', 'Preparing run')

    if (!Compiler.isReady()) {
      logger.err('Compiler', 'Compiler module not ready')
      return
    }

    //this.updateDefaultParams()
    if (!this.params.isEmpty() && !this.params.isBuilt())
      this.params.updateDesc(GPU.device)

    if (this.shaderDirty) {
      logger.trace('Project', 'Compiling..')
      if (!this.compileShaders())
        return
      this.shaderDirty = false
    }

    logger.trace('Project', 'Creating Pipeline..')
    this.initPipeline()
    

    this.lastStartTime = performance.now()

    logger.trace("debug output", this.shaderSrc)
    this.running = true
    this.status = 'Running'
    logger.trace('Project', 'Ready')
  }

  renderFrame = () => {

    //this.updateDefaultParams()
    this.encodeCommands()
    
  }

  initPipeline = () => {
    this.mapBuffers()
    this.createPipeline()
  }

  updateDefaultParams = (paramDesc: ParamDesc[], logger: Logger) => {
    if(GPU.isInitialized()) 
      this.shaderDirty = this.included.set(paramDesc, GPU.device) || this.shaderDirty
  }

  setParams = (params: ParamDesc[]) => {
    let updateDesc = this.params.set(params, GPU.device)
    if (updateDesc) {
      this.shaderDirty = true
      if (this.running)
        this.stop()
    } 
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

  compileShaders = (): boolean => {
    // this.shaderSrc = this.included.getShaderDecl()
    //   .concat(this.vertexDecl)
    //   .concat(this.params.getShaderDecl())
    //   .concat(this.userSrc)

    this.shaderSrc = this.included.getShaderDecl().concat(this.params.getShaderDecl()).concat(this.vertexDecl).concat(`
    [[stage(fragment)]]
    fn main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
        
      let col = 0.5 * cos(in.uv.xyx + i.time  + vec3<f32>(0., 2., 4.)) + 0.5;
      return vec4<f32>(col, 1.0);

    }
    `)
    let module = Compiler.compileWGSL!(GPU.device, this.shaderSrc)
    if (!module)
      return false
    this.shaderModule = module
    return true
  }

  createPipeline = () => {
    if (!GPU.isInitialized())
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

  setShaderSrc = (src: string) => {
    this.userSrc = src
    this.shaderDirty = true
  }
}

const WorkingProject = new Project()
export default WorkingProject;
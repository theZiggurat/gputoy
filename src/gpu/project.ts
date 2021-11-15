import Params, {ParamDesc, ParamType} from './params'
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
  attachCanvas = async (canvasId: string) => {

    // if gpu is not initialized
    // keep trying unless browser is incompatible
    while (!GPU.isInitialized()) {
      this.status = 'Initializing'
      let status = await GPU.init()
      if (status === 'incompatible') {
        this.status = 'Browser Incompatible'
        Console.fatal('Error', 'Browser Incompatable. Try https://caniuse.com/webgpu to find browsers compatible with WebGPU')
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

    Console.clear()

    this.updateDefaultParams()
    if (!this.params.isEmpty() && !this.params.isBuilt())
      this.params.updateDesc(GPU.device)

    if (this.shaderDirty) 
      this.compile()

    this.lastStartTime = performance.now()

    //Console.trace("debug output", this.shaderSrc)
    this.running = true
    this.status = 'Running'
    Console.trace('Project', 'Running')
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
    Console.trace('Project', 'Pausing')
    if (!GPU.isInitialized())
      return
    this.status = 'Paused'
    this.running = false
    this.prevDuration = this.runDuration
  }

  // stops render loop with restarting
  stop = () => {
    Console.trace('Project', 'Stopping')
    if (!GPU.isInitialized())
      return
    
    this.shaderDirty = true
    this.status = 'Ok'
    this.running = false
    this.frameNum = 0
    this.runDuration = 0
  }

  restart = () => {
    console.log('restart')
    this.stop()
    this.run()
  }

  halt = () => {
    console.log('halt')
    this.stop()
    this.dt = 0
    this.status = "Error"
  }

  compile() {
    Console.trace('Project', 'Compiling..')
    this.mapBuffers()
    this.compileShaders()
    this.createPipeline()
    this.shaderDirty = false
  }

  updateDefaultParams = () => {

    let rect = this.canvas.getBoundingClientRect()
    let mouseNorm = [this.mousePos[0] / rect.width, 1 - this.mousePos[1] / rect.height]

    this.shaderDirty = this.included.set([
      {paramName: 'time', paramType: 'float', param: [this.runDuration]},
      {paramName: 'dt',   paramType: 'float', param: [this.dt]},
      {paramName: 'mouseNorm', paramType: 'vec2f', param: mouseNorm},
      {paramName: 'aspectRatio', paramType: 'float', param: [rect.width / rect.height]},
      {paramName: 'res', paramType: 'vec2i', param: [rect.width, rect.height]},
      {paramName: 'frame', paramType: 'int', param: [this.frameNum]},
      {paramName: 'mouse', paramType: 'vec2i', param: [this.mousePos[0], rect.height - this.mousePos[1]]},
    ], GPU.device) || this.shaderDirty
  }

  setParams = (params: ParamDesc[], _updateDesc: boolean) => {
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

  compileShaders = () => {
    this.shaderSrc = this.included.getShaderDecl()
      .concat(this.vertexDecl)
      .concat(this.params.getShaderDecl())
      .concat(this.userSrc)
    this.shaderModule = GPU.device.createShaderModule({
      code: this.shaderSrc
    })
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

    //Console.log("Shader", this.shaderSrc)

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
    if (this.running)
      this.halt()
  }

  onStart: () => void = () => {}
  onPause: () => void = () => {}
  onStop: () => void = () => {}
  onHalt: () => void = () => {}

  setShaderSrc = (src: string) => {
    this.userSrc = src
    this.shaderDirty = true
  }
}

const WorkingProject = new Project()
export default WorkingProject;
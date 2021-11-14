/**
 * TODO: add mat4, vec4f, vec4i, and rgba
 */
export type ParamType = 'int' | 'float' | 'color' | 'vec3f' | 'vec2f' | 'vec3i' | 'vec2i'

/**
 * Holds data and metadata for single parameter in uniform
 */
export interface ParamDesc {
  paramName: string,
  paramType: ParamType
  param: number[]
}

const declInfo = {
  'int':    { size: 4,   align: 4,   order: 6, decl: 'i32',       writeType: 'int'   },
  'float':  { size: 4,   align: 4,   order: 3, decl: 'f32',       writeType: 'float' },
  'color':  { size: 12,  align: 16,  order: 1, decl: 'vec3<f32>', writeType: 'float' },
  'vec3f':  { size: 12,  align: 16,  order: 0, decl: 'vec3<f32>', writeType: 'float' },
  'vec3i':  { size: 12,  align: 16,  order: 4, decl: 'vec3<i32>', writeType: 'int'   },
  'vec2f':  { size: 8,   align: 8,   order: 2, decl: 'vec2<f32>', writeType: 'float' },
  'vec2i':  { size: 8,   align: 8,   order: 5, decl: 'vec2<i32>', writeType: 'int'   },
}

export const encode = (val: number[], type: ParamType): string => {
  switch (type) {
    case 'color': return "#".concat(val.map(d => (d*255).toString(16)).join())
    default: return val.map(toString).join(',')
  }
}

export const decode = (val: string, type: ParamType): number[] => {
  switch (type) {
    case 'float': return [parseFloat(val)]
    case 'int': return [parseInt(val)]
    case 'vec2f'||'vec3f': return val.split(',').map(parseFloat)
    case 'vec2i'||'vec3i': return val.split(',').map(parseInt)
    case 'color': {
      let z = parseInt(val.substr(1), 16)
      return [(z >> 16 & 0xFF)/255, (z >> 8 & 0xFF)/255, (z >> 0 & 0xFF)/255]
    }
    default: return [0]
  }
}



class Params {

  private name: string
  private prefix: string

  private params: ParamDesc[] = []
  private byteOffsets: number[] = []

  private frozen: ConstrainBoolean

  private binding: number
  private group: number
  private sizeByte: number = 0

  private bindGroup!: GPUBindGroup
  private bindGroupLayout!: GPUBindGroupLayout
  private buffer!: GPUBuffer
  private shaderDecl: string = ""

  constructor(name: string, prefix: string, frozen: boolean = false, group: number = 0, binding: number = 0) {
    this.name = name
    this.prefix = prefix
    this.frozen = frozen
    this.group = group
    this.binding = binding
  }

  /**
   * Sets the parameters for this instance
   * @inparams params list of param descriptors
   * @returns whether the project these parameters belong to should recompile
   */
  set = (inparams: ParamDesc[], device: GPUDevice): boolean => {

    let needRecompile = inparams.length != this.params.length
    if (!needRecompile && !this.frozen) {
      // determines if param name and type are the same. 
      // if they are, there is no need to recompile
      needRecompile = !inparams.every(newp => {
        let match = this.params.find(oldp => newp.paramName === oldp.paramName)
        return match ?  newp.paramType === match.paramType : false
      })
    }
    //this.params = inparams.sort((a, b) => declInfo[a.paramType].order - declInfo[b.paramType].order)
    if (needRecompile)
      this.updateDesc(device)

    this.uploadToGPU(device)
    return needRecompile
  }

  /**
   * Generates descriptors and allocates uniform buffer storage for current params
   * Desc must be generated before calling updateBuffer
   * @param device current active GPU device. will return if not initialized
   * @param group bind group of uniform block (default 0)
   * @param binding bind index of uniform block (default 0)
   * @returns shader header that will declare the uniform block
   */
  updateDesc = (device: GPUDevice) => {
    const roundUp = (k: number, n: number) => Math.ceil(n / k) * k
    
    if (!device) return
    
    let unidecl = []
    this.byteOffsets = []
    this.sizeByte = 0
    let align = 0

    if(this.params.length > 0) {
      unidecl.push(`[[block]] struct ${this.name} {`)
      this.params.forEach((p, idx) => {
        this.byteOffsets[idx] = idx == 0 ? 0 : 
          roundUp(declInfo[p.paramType].align, this.byteOffsets[idx-1] + declInfo[this.params[idx-1].paramType].size)
        align = Math.max(align, declInfo[p.paramType].align)
        unidecl.push(`\t${p.paramName}: ${declInfo[p.paramType].decl};`)
      })
      unidecl.push(`};\n[[group(${this.group}), binding(${this.binding})]]\nvar<uniform> ${this.prefix}: ${this.name};\n`)
      let lastMemberType = this.params[this.params.length - 1].paramType
      this.sizeByte = roundUp(align, this.byteOffsets[this.params.length - 1] + declInfo[lastMemberType].size)
    }

    this.shaderDecl = unidecl.join("\n")
    this.buffer = device.createBuffer({
      label: `${this.name}Buffer`,
      size: this.sizeByte,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.bindGroupLayout = device.createBindGroupLayout({
      label: `${this.name}BindGroupLayout`,
      entries: [{
        binding: this.binding,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'uniform'
        }
      }]
    })
    this.bindGroup = device.createBindGroup({
      label: `${this.name}BindGroup`,
      layout: this.bindGroupLayout,
      entries: [{
        binding: this.binding,
        resource: { buffer: this.buffer }
      }]
    })
  }


  /**
   * Maps current params to internal buffer which can be accessed by getBuffer()
   * @param device current active GPU device. will return if not initialized
   */
  uploadToGPU = (device: GPUDevice) => {

    if (!device || this.params.length == 0) return

    let byteBuffer = new ArrayBuffer(this.sizeByte)
    let floatView = new Float32Array(byteBuffer, 0, this.sizeByte / 4)
    let intView = new Int32Array(byteBuffer, 0, this.sizeByte / 4)

    this.params.forEach((p, idx) => {
      if (declInfo[p.paramType].writeType == 'int')
        intView.set(p.param, this.byteOffsets[idx] / 4)
      else
        floatView.set(p.param, this.byteOffsets[idx] / 4)
    })

    device.queue.writeBuffer(
      this.buffer,
      0,
      byteBuffer,
      0,
      byteBuffer.byteLength
    )
  }

  isEmpty = (): boolean => {
    return this.params.length == 0
  }

  getBindGroup = (): GPUBindGroup => {
    return this.bindGroup
  }

  getBindGroupLayout = (): GPUBindGroupLayout => {
    return this.bindGroupLayout
  }

  getBuffer = (): GPUBuffer => {
    return this.buffer
  }

  getShaderDecl = (): string => {
    return this.shaderDecl
  }
}

export default Params
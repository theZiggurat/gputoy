import { Logger } from 'core/recoil/atoms/console'
import * as types from '../core/types'

const declInfo = {
  'int': { size: 4, align: 4, order: 6, glsl: 'int', wgsl: 'i32', writeType: 'int' },
  'float': { size: 4, align: 4, order: 3, glsl: 'float', wgsl: 'f32', writeType: 'float' },
  'color': { size: 12, align: 16, order: 1, glsl: 'vec3', wgsl: 'vec3<f32>', writeType: 'float' },
  'vec3f': { size: 12, align: 16, order: 0, glsl: 'vec3', wgsl: 'vec3<f32>', writeType: 'float' },
  'vec3i': { size: 12, align: 16, order: 4, glsl: 'ivec3', wgsl: 'vec3<i32>', writeType: 'int' },
  'vec2f': { size: 8, align: 8, order: 2, glsl: 'vec2', wgsl: 'vec2<f32>', writeType: 'float' },
  'vec2i': { size: 8, align: 8, order: 5, glsl: 'ivec2', wgsl: 'vec2<i32>', writeType: 'int' },
}

export const encode = (val: number[], type: types.ParamType): string => {
  switch (type) {
    case 'color': return "#".concat(val.map(d => {
      let v = (d * 255).toString(16)
      return v.length == 1 ? '0' + v : v
    }).join(''))
    case 'int': return val[0].toString()
    case 'float': return val[0].toString()
    default: return val.map(toString).join(',')
  }
}

export const decode = (val: string, type: types.ParamType): number[] => {
  switch (type) {
    case 'float': return [parseFloat(val)]
    case 'int': return [parseInt(val)]
    case 'vec2f' || 'vec3f': return val.split(',').map(parseFloat)
    case 'vec2i' || 'vec3i': return val.split(',').map(parseInt)
    case 'color': {
      let z = parseInt(val.substr(1), 16)
      return [(z >> 16 & 0xFF) / 255, (z >> 8 & 0xFF) / 255, (z >> 0 & 0xFF) / 255]
    }
    default: return [0]
  }
}

class Params {

  private name: string
  private prefix: string

  private params: types.ParamDesc[] = []
  private byteOffsets: number[] = []

  private frozen: boolean
  private built: boolean = false

  private binding: number
  private group: number
  private sizeByte: number = 0

  private bindGroup!: GPUBindGroup
  private bindGroupLayout!: GPUBindGroupLayout
  private buffer!: GPUBuffer

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
  set = (inparams: types.ParamDesc[], device: GPUDevice, logger?: Logger): boolean => {

    let needRecompile = inparams.length != this.params.length
    if (!needRecompile && !this.frozen) {
      // determines if param name and type are the same. 
      // if they are, there is no need to recompile
      needRecompile = !inparams.every(newp => {
        let match = this.params.find(oldp => newp.paramName === oldp.paramName)
        return match ? newp.paramType === match.paramType : false
      })
    }
    this.params = inparams
    if (needRecompile) {
      this.built = false
      this.updateDesc(device, logger)
    }


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
  updateDesc = (device: GPUDevice, logger?: Logger) => {
    const roundUp = (k: number, n: number) => Math.ceil(n / k) * k

    if (!device) {
      logger?.err(`Params_@${this.name}`, 'No device to update param descriptors. Aborting.')
      return
    }

    this.byteOffsets = []
    this.sizeByte = 0
    let align = 0

    if (this.params.length > 0) {
      this.params.forEach((p, idx) => {
        this.byteOffsets[idx] = idx == 0 ? 0 :
          roundUp(declInfo[p.paramType].align, this.byteOffsets[idx - 1] + declInfo[this.params[idx - 1].paramType].size)
        align = Math.max(align, declInfo[p.paramType].align)
      })
      let lastMemberType = this.params[this.params.length - 1].paramType
      this.sizeByte = roundUp(align, this.byteOffsets[this.params.length - 1] + declInfo[lastMemberType].size)
    }

    if (this.sizeByte == 0) return

    this.buffer = device.createBuffer({
      label: `${this.name}Buffer`,
      size: this.sizeByte,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    logger?.debug(`Params_@${this.name}`, `Buffer created with size of ${this.sizeByte} bytes and config: \n`.concat(
      this.params.map((p: types.ParamDesc, idx: number) => `${this.byteOffsets[idx]}\t${p.paramName}\t\t${declInfo[p.paramType].size} bytes -- ${declInfo[p.paramType].align} align`).join('\n')
    ))

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
    logger?.debug(`Params_@${this.name}`, `Bind group created at binding ${this.binding}`)

    this.built = true
  }


  /**
   * Maps current params to internal buffer which can be accessed by getBuffer()
   * @param device current active GPU device. will return if not initialized
   */
  uploadToGPU = (device: GPUDevice) => {

    if (!device || this.params.length == 0) return

    console.log('PARAM', this)

    let byteBuffer = new ArrayBuffer(this.sizeByte)
    let floatView = new Float32Array(byteBuffer, 0, this.sizeByte / 4)
    let intView = new Int32Array(byteBuffer, 0, this.sizeByte / 4)



    console.log('fbufsize', this.sizeByte / 4)
    this.params.forEach((p, idx) => {

      if (declInfo[p.paramType].writeType == 'int')
        intView.set(p.param, this.byteOffsets[idx] / 4)
      else
        floatView.set(p.param, this.byteOffsets[idx] / 4)
      console.log('p')
    })

    device.queue.writeBuffer(
      this.buffer,
      0,
      byteBuffer,
      0,
      byteBuffer.byteLength
    )
  }

  getBindGroup = (): GPUBindGroup => this.bindGroup
  getBindGroupLayout = (): GPUBindGroupLayout => this.bindGroupLayout
  getBuffer = (): GPUBuffer => this.buffer
  getShaderDecl = (lang: string): string => {
    if (this.params.length == 0) return ''
    let unidecl = []
    if (lang == 'wgsl') {
      //unidecl.push('[[block]]')
      unidecl.push(`struct ${this.name} {`)
      this.params.forEach(p => unidecl.push(`\t${p.paramName}: ${declInfo[p.paramType].wgsl};`))
      unidecl.push(`};\n[[group(${this.group}), binding(${this.binding})]]\nvar<uniform> ${this.prefix}: ${this.name};\n`)
    } else {
      unidecl.push(`layout(binding = ${this.binding}, set = ${this.group}) uniform ${this.name} {`)
      this.params.forEach(p => unidecl.push(`\t${declInfo[p.paramType].glsl} ${p.paramName};`))
      unidecl.push(`} ${this.prefix};\n`)
    }
    return unidecl.join('\n')
  }

  isEmpty = (): boolean => this.params.length == 0
  isBuilt = (): boolean => this.built

}

export default Params
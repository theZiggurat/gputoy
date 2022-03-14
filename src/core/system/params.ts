import { Logger } from 'core/recoil/atoms/console'
import * as types from '@core/types'
import { typeInfo } from '@core/types'

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
  set = (_inparams: types.ParamDesc[], device: GPUDevice, logger?: Logger): boolean => {

    const inparams = _inparams.filter(p => !!p.paramName)
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

    const namedParams = this.params.filter(p => !!p.paramName)

    if (namedParams.length > 0) {
      namedParams.forEach((p, idx) => {
        this.byteOffsets[idx] = idx == 0 ? 0 :
          roundUp(typeInfo[p.paramType].align, this.byteOffsets[idx - 1] + typeInfo[namedParams[idx - 1].paramType].size)
        align = Math.max(align, typeInfo[p.paramType].align)
      })
      let lastMemberType = namedParams[namedParams.length - 1].paramType
      this.sizeByte = roundUp(align, this.byteOffsets[namedParams.length - 1] + typeInfo[lastMemberType].size)
    }

    if (this.sizeByte == 0) return

    this.buffer = device.createBuffer({
      label: `${this.name}Buffer`,
      size: this.sizeByte,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    logger?.debug(`Params`, `Buffer \`${this.name}\` created with size of ${this.sizeByte} bytes and config: \n`.concat(
      namedParams.map((p: types.ParamDesc, idx: number) => `${this.byteOffsets[idx]}\t${p.paramName}\t\t${typeInfo[p.paramType].size} bytes -- ${typeInfo[p.paramType].align} align`).join('\n')
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
    const namedParams = this.params.filter(p => !!p.paramName)
    if (!device || namedParams.length == 0) return

    let byteBuffer = new ArrayBuffer(this.sizeByte)
    let floatView = new Float32Array(byteBuffer, 0, this.sizeByte / 4)
    let intView = new Int32Array(byteBuffer, 0, this.sizeByte / 4)

    namedParams.forEach((p, idx) => {
      if (typeInfo[p.paramType].writeType == 'int')
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

  getBindGroup = (): GPUBindGroup => this.bindGroup
  getBindGroupLayout = (): GPUBindGroupLayout => this.bindGroupLayout
  getBuffer = (): GPUBuffer => this.buffer
  getShaderDecl = (lang: types.ExtensionShader): string => {
    const namedParams = this.params.filter(p => !!p.paramName)
    if (namedParams.length == 0) return ''
    let unidecl = []
    if (lang == 'wgsl') {
      //unidecl.push('[[block]]')
      unidecl.push(`struct ${this.name} {`)
      namedParams.forEach(p => unidecl.push(`\t${p.paramName}: ${typeInfo[p.paramType].wgsl};`))
      unidecl.push(`};\n@group(${this.group}) @binding(${this.binding}) var<uniform> ${this.prefix}: ${this.name};\n`)
    } else {
      unidecl.push(`layout(binding = ${this.binding}, set = ${this.group}) uniform ${this.name} {`)
      namedParams.forEach(p => unidecl.push(`\t${typeInfo[p.paramType].glsl} ${p.paramName};`))
      unidecl.push(`} ${this.prefix};\n`)
    }
    return unidecl.join('\n')
  }

  isEmpty = (): boolean => this.params.length == 0
  isBuilt = (): boolean => this.built

}

export default Params
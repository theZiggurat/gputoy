import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'


type BufferInit = {
  label: string,
  model: types.Model

  // uniform, storage, read-only storage
  bufferBindingType: GPUBufferBindingType

  // flags how the buffer will be used
  bufferUsageFlags: GPUBufferUsageFlags

  size?: number
  initialValue?: number[][]
}


export default class BufferResource implements types.Resource {

  label: string
  buffer: GPUBuffer
  bufferBindingType: GPUBufferBindingType
  bufferUsageFlags: GPUBufferUsageFlags
  bufferMemLayout: types.ModelMemLayout

  constructor(
    label: string,
    buffer: GPUBuffer,
    bufferBindingType: GPUBufferBindingType,
    bufferUsageFlags: GPUBufferUsageFlags,
    bufferMemLayout: types.ModelMemLayout
  ) {
    this.label = label
    this.buffer = buffer
    this.bufferBindingType = bufferBindingType
    this.bufferUsageFlags = bufferUsageFlags
    this.bufferMemLayout = bufferMemLayout
  }


  destroy = (logger?: Logger) => {
    logger?.debug(`Resource::Texture[${this.label}]`, `Destroying`)
    this.buffer.destroy()
  }

  public static build = async (
    bufferInit: BufferInit,
    device: GPUDevice,
    logger?: Logger
  ): Promise<types.Resource | undefined> => {

    const { label, model, initialValue, size, bufferUsageFlags, bufferBindingType } = bufferInit

    let bufferMemLayout = types.getModelMemLayout(model)
    let { byteSize, byteOffsets, writeSizes, writeTypes } = bufferMemLayout

    const shouldMap = !!initialValue

    device.pushErrorScope('validation')
    let buffer = device.createBuffer({
      label,
      size: byteSize,
      usage: bufferUsageFlags,
      mappedAtCreation: shouldMap
    })

    let bufferCreationError = await device.popErrorScope()
    if (bufferCreationError) {
      logger?.err('Resource::Buffer', `Could not create buffer [${label ?? 'unknown'}]. Reason: ${bufferCreationError}`)
      return undefined
    }

    if (shouldMap) {
      device.pushErrorScope('validation')
      const byteBuf = buffer.getMappedRange()
      let floatView = new Float32Array(byteBuf, 0, byteSize / 4)
      let intView = new Int32Array(byteBuf, 0, byteSize / 4)

      for (let i = 0; i < byteOffsets.length; i++) {
        if (writeTypes[i] === 'int')
          intView.set(initialValue[i], byteOffsets[i] / 4)
        else
          floatView.set(initialValue[i], byteOffsets[i] / 4)


      }

      buffer.unmap()
      let bufferMapError = await device.popErrorScope()
      if (bufferMapError) {
        logger?.err('Resource::Buffer', `Could not create buffer [${label ?? 'unknown'}]. Reason: ${bufferMapError}`)
        return undefined
      }
    }

    let ret = new BufferResource(label, buffer, bufferBindingType, bufferUsageFlags, bufferMemLayout)
    return ret
  }

  getBindGroupEntry = (binding: number): GPUBindGroupEntry => {
    return {
      binding,
      resource: {
        buffer: this.buffer
      }
    }
  }

  getBindGroupLayoutEntry = (binding: number, visibility: number): GPUBindGroupLayoutEntry => {
    return {
      binding,
      visibility,
      buffer: {
        type: this.bufferBindingType
      }
    }
  }

  write = async (buf: ArrayLike<number[]>) => {

    const { byteSize, byteOffsets, writeTypes } = this.bufferMemLayout

    await this.buffer.mapAsync(GPUMapMode.WRITE,)
    const byteBuf = this.buffer.getMappedRange()
    let floatView = new Float32Array(byteBuf, 0, byteSize / 4)
    let intView = new Int32Array(byteBuf, 0, byteSize / 4)

    for (let i = 0; i < byteOffsets.length; i++) {
      if (writeTypes[i] === 'int')
        intView.set(buf[i], byteOffsets[i] / 4)
      else
        floatView.set(buf[i], byteOffsets[i] / 4)
    }
  }

}
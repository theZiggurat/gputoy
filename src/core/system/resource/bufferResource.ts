import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import { NagaType } from '@core/types'


type BufferInit = {
  label: string,
  layout: types.NagaTypeStructFull

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
  layout: types.NagaTypeStructFull
  optimizedMemLayout: types.NagaStructMemoryLayout
  bufferBindingType: GPUBufferBindingType
  bufferUsageFlags: GPUBufferUsageFlags


  constructor(
    label: string,
    buffer: GPUBuffer,
    bufferBindingType: GPUBufferBindingType,
    bufferUsageFlags: GPUBufferUsageFlags,
    layout: types.NagaTypeStructFull,
    optimizedMemLayout: types.NagaStructMemoryLayout
  ) {
    this.label = label
    this.buffer = buffer
    this.bufferBindingType = bufferBindingType
    this.bufferUsageFlags = bufferUsageFlags
    this.layout = layout
    this.optimizedMemLayout = optimizedMemLayout
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

    const { label, layout, initialValue, size, bufferUsageFlags, bufferBindingType } = bufferInit
    const { span } = layout
    const optimizedMemLayout = types.getMemoryLayout(layout)

    const shouldMap = !!initialValue

    device.pushErrorScope('validation')
    let buffer = device.createBuffer({
      label,
      size: span,
      usage: bufferUsageFlags,
      mappedAtCreation: shouldMap
    })

    let bufferCreationError = await device.popErrorScope()
    if (bufferCreationError) {
      logger?.err('Resource::Buffer', `Could not create buffer [${label ?? 'unknown'}]. Reason: ${bufferCreationError}`)
      return undefined
    }

    let ret = new BufferResource(label, buffer, bufferBindingType, bufferUsageFlags, layout, optimizedMemLayout)
    if (shouldMap) {
      device.pushErrorScope('validation')
      const byteBuf = buffer.getMappedRange()
      ret._writeByteBuf(initialValue, byteBuf)
      buffer.unmap()
      let bufferMapError = await device.popErrorScope()
      if (bufferMapError) {
        logger?.err('Resource::Buffer', `Could not create buffer [${label ?? 'unknown'}]. Reason: ${bufferMapError}`)
        return undefined
      }
    }

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

  write = async (buf: ArrayLike<number[]>, queue: GPUQueue) => {

    const { span } = this.layout
    const byteBuf = new ArrayBuffer(span)
    this._writeByteBuf(buf, byteBuf)
    queue.writeBuffer(
      this.buffer,
      0,
      byteBuf,
      0,
      span
    )
  }


  _writeByteBuf = (buf: ArrayLike<number[]>, byteBuffer: ArrayBuffer, logger?: Logger) => {
    const { span } = this.layout
    const { byteOffsets, scalarTypes } = this.optimizedMemLayout
    const entryLen = byteOffsets.length
    let floatView = new Float32Array(byteBuffer, 0, span / 4)
    let intView = new Int32Array(byteBuffer, 0, span / 4)
    let uintView = new Uint32Array(byteBuffer, 0, span / 4)
    let byteView = new Uint8Array(byteBuffer, 0, span)

    for (let i = 0; i < buf.length; i++) {
      const entryIndex = i % entryLen
      switch (scalarTypes[entryIndex]) {
        case 0: intView.set(buf[i], byteOffsets[entryIndex] / 4); break
        case 1: uintView.set(buf[i], byteOffsets[entryIndex] / 4); break
        case 2: floatView.set(buf[i], byteOffsets[entryIndex] / 4); break
        case 3: {
          if (this.bufferUsageFlags & GPUBufferUsage.UNIFORM) {
            logger?.err(`Resource::Buffer[${this.label}]`, 'Uniform buffer must be host-sharable type (int, uint, float) and their composites.')
            continue
          }
          byteView.set(buf[i], byteOffsets[entryIndex])
        }
      }
    }
  }

}
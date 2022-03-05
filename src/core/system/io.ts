import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import TextureResource, { CanvasTextureResource } from './resource/textureResource'
import GPU from '@core/system/gpu'
import BufferResource from './resource/bufferResource'

export class ViewportIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'write' as 'write'

  texture!: CanvasTextureResource

  build = async (args: types.IOArgs, logger?: Logger): Promise<boolean> => {
    const { canvasId } = args as types.ViewportIOArgs
    if (!canvasId) return false

    const tex = await CanvasTextureResource.fromId(canvasId, GPU.device, GPU.adapter)
    if (!tex) {
      logger?.err(`System::IO::Viewport[${canvasId}]`, 'Could not contruct texture resource due to previous error')
      return false
    }
    logger?.trace(`System::IO::Viewport[${canvasId}]`, 'Initialization complete')
    this.texture = tex as CanvasTextureResource
    return true
  }
  destroy = (logger?: Logger) => {
    logger?.debug(`System::IO::Viewport[${this.texture.getCanvasId()}]`, 'Destroying')
    this.texture.destroy()
  }
  getModels = (): Record<string, types.Model> => {
    return {}
  }
  getResource = (): types.Resource => {
    return this.texture
  }

  onBeginDispatch = () => { }
  onEndDispatch = () => { }
}




export class MouseIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'read' as 'read'

  buffer!: BufferResource
  elem!: HTMLElement

  onMouseMove = e => {
  }

  onMouseDown = e => {
    console.log('onMouseDown', e)
  }

  onMouseUp = e => {
    console.log('onMouseUp', e)
  }

  build = async (args: types.IOArgs, logger?: Logger): Promise<boolean> => {
    const { eventTargetId } = args as types.MouseIOArgs
    if (!eventTargetId) return false

    const elem = document.getElementById(eventTargetId)
    if (!elem) {
      logger?.err(`System::IO::Mouse`, `Cannot find element at id: ${eventTargetId}`)
      return false
    }

    let buffer = await BufferResource.build({
      label: `System::IO::Mouse[${this.elem.id}]`,
      model: this.getModels()[0],
      bufferBindingType: 'uniform',
      bufferUsageFlags: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    }, GPU.device, logger)

    if (!buffer) {
      return false
    }

    this.buffer = buffer as BufferResource

    elem.addEventListener('mousemove', this.onMouseMove)
    elem.addEventListener('mousedown', this.onMouseDown)
    elem.addEventListener('mouseup', this.onMouseUp)
    this.elem = elem

    return true
  }
  destroy = (logger?: Logger) => {
    logger?.debug(`System::IO::Mouse[${this.elem.id}]`, 'Destroying')
    this.elem.addEventListener('mousemove', this.onMouseMove)
    this.elem.addEventListener('mousedown', this.onMouseDown)
    this.elem.addEventListener('mouseup', this.onMouseUp)
    this.buffer.destroy()
  }

  getModels = (): Record<string, types.Model> => {
    return {
      'Mouse': {
        definingFileId: 'internal',
        dependentFileIds: [],
        name: 'Mouse',
        schema: {
          'pixel': 'vec2i',
          'pixelf': 'vec2f',
          'norm': 'vec2f',
          'btn1': 'int',
          'btn2': 'int',
          'btn3': 'int',
        }
      }
    }
  }

  getResource = (): types.Resource => {
    return this.buffer
  }

  onBeginDispatch = () => {


  }

  onEndDispatch = () => { }
}

export class StateIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'write' as 'write'

  texture!: CanvasTextureResource

  build = async (args: types.IOArgs, logger?: Logger): Promise<boolean> => {
    const { canvasId } = args as types.ViewportIOArgs
    if (!canvasId) return false

    const tex = await CanvasTextureResource.fromId(canvasId, GPU.device, GPU.adapter)
    if (!tex) {
      logger?.err(`System::IO::Viewport[${canvasId}]`, 'Could not contruct texture resource due to previous error')
      return false
    }
    this.texture = tex as CanvasTextureResource
    return false
  }
  destroy = (logger?: Logger) => {
    logger?.debug(`System::IO::Viewport[${this.texture.getCanvasId()}]`, 'Destroying')
    this.texture.destroy()
  }
  getModels = (): Record<string, types.Model> => {
    return {}
  }
  getResource = (): types.Resource => {
    return this.texture
  }

  onBeginDispatch = () => { }
  onEndDispatch = () => { }
}
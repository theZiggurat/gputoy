import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import TextureResource, { CanvasTextureResource } from './resource/textureResource'
import GPU from '@core/system/gpu'
import BufferResource from './resource/bufferResource'
import { Model } from '@core/types'

export class ViewportIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'write' as 'write'

  label!: string
  texture!: CanvasTextureResource

  build = async (args: types.IOArgs, label: string, logger?: Logger): Promise<boolean> => {
    const { canvasId } = args as types.ViewportIOArgs
    if (!canvasId) return false

    this.label = label

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
  getNamespace = (): types.Namespace => {
    const label = this.label
    let ret: types.Namespace = {
      exported: {
        definingFileId: `IO::Viewport[${label}]`,
        dependentFileIds: [],
        name: `Viewport_${label}`,
        indexedTypes: [],
        namedTypes: {}
      },
      imported: []
    }
    return ret
  }
  getResource = (): types.Resource => {
    return this.texture
  }

  onBeginDispatch = (queue: GPUQueue) => { }
  onEndDispatch = (queue: GPUQueue) => { }
}




export class MouseIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'read' as 'read'

  label!: string
  buffer!: BufferResource
  elem!: HTMLElement

  mousePos: number[] = [0, 0]
  mouseNorm: number[] = [0, 0]
  m1: number = 0
  m2: number = 0
  m3: number = 0

  onMouseMove = e => {
  }

  onMouseDown = e => {
    console.log('onMouseDown', e)
  }

  onMouseUp = e => {
    console.log('onMouseUp', e)
  }

  build = async (args: types.IOArgs, label: string, logger?: Logger): Promise<boolean> => {
    const { eventTargetId } = args as types.MouseIOArgs
    if (!eventTargetId) return false

    this.label = label

    const elem = document.getElementById(eventTargetId)
    if (!elem) {
      logger?.err(`System::IO::Mouse`, `Cannot find element at id: ${eventTargetId}`)
      return false
    }

    let buffer = await BufferResource.build({
      label: `System::IO::Mouse[${this.elem.id}]`,
      type: this.getNamespace().exported.indexedTypes[3],
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
    this.elem.removeEventListener('mousemove', this.onMouseMove)
    this.elem.removeEventListener('mousedown', this.onMouseDown)
    this.elem.removeEventListener('mouseup', this.onMouseUp)
    this.buffer.destroy()
  }

  getNamespace = (): types.Namespace => {
    return {
      exported: {
        definingFileId: `IO::Mouse[${this.label}]`,
        dependentFileIds: [],
        name: 'io_mouse_' + this.label,
        indexedTypes: [
          {
            "name": null,
            "inner": {
              "Vector": {
                "size": "Bi",
                "kind": "Sint",
                "width": 4
              }
            }
          },
          {
            "name": null,
            "inner": {
              "Vector": {
                "size": "Bi",
                "kind": "Float",
                "width": 4
              }
            }
          },
          {
            "name": null,
            "inner": {
              "Scalar": {
                "kind": "Bool",
                "width": 1
              }
            }
          },
          {
            "name": "Mouse",
            "inner": {
              "Struct": {
                "members": [
                  {
                    "name": "pixel",
                    "ty": 1,
                    "binding": null,
                    "offset": 0
                  },
                  {
                    "name": "pixelf",
                    "ty": 2,
                    "binding": null,
                    "offset": 8
                  },
                  {
                    "name": "norm",
                    "ty": 2,
                    "binding": null,
                    "offset": 16
                  },
                  {
                    "name": "btn1",
                    "ty": 3,
                    "binding": null,
                    "offset": 24
                  },
                  {
                    "name": "btn2",
                    "ty": 3,
                    "binding": null,
                    "offset": 25
                  },
                  {
                    "name": "btn3",
                    "ty": 3,
                    "binding": null,
                    "offset": 26
                  }
                ],
                "span": 32
              }
            }
          }
        ],
        namedTypes: { "Mouse": 4 }
      },
      imported: []
    }
  }

  getResource = (): types.Resource => {
    return this.buffer
  }

  onBeginDispatch = (queue: GPUQueue) => {

  }

  onEndDispatch = (queue: GPUQueue) => {

  }
}

// export class StateIO implements types.IO {
//   type: types.IOType = 'viewport'
//   usage = 'write' as 'write'

//   texture!: CanvasTextureResource

//   build = async (args: types.IOArgs, logger?: Logger): Promise<boolean> => {
//     const { canvasId } = args as types.ViewportIOArgs
//     if (!canvasId) return false

//     const tex = await CanvasTextureResource.fromId(canvasId, GPU.device, GPU.adapter)
//     if (!tex) {
//       logger?.err(`System::IO::Viewport[${canvasId}]`, 'Could not contruct texture resource due to previous error')
//       return false
//     }
//     this.texture = tex as CanvasTextureResource
//     return false
//   }
//   destroy = (logger?: Logger) => {
//     logger?.debug(`System::IO::Viewport[${this.texture.getCanvasId()}]`, 'Destroying')
//     this.texture.destroy()
//   }
//   getModels = (): Record<string, types.Model> => {
//     return {}
//   }
//   getResource = (): types.Resource => {
//     return this.texture
//   }

//   onBeginDispatch = () => { }
//   onEndDispatch = () => { }
// }
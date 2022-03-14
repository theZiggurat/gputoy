import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import { CanvasTextureResource } from './resource/textureResource'
import GPU from '@core/system/gpu'
import BufferResource from './resource/bufferResource'

export class ViewportIO implements types.IO {
  type: types.IOType = 'viewport'
  usage = 'write' as 'write'

  label!: string
  texture!: CanvasTextureResource

  private mousebuffer!: BufferResource
  private resbuffer!: BufferResource

  canvasElem!: HTMLElement
  mouseElem!: HTMLElement
  mousePos: number[] = [0, 0]
  mouseNorm: number[] = [0, 0]
  m1: number = 0
  m2: number = 0
  m3: number = 0

  res: number[] = [0, 0]

  needUpdate = true

  onMouseMove = (ev: MouseEvent) => {
    const rect = this.mouseElem.getBoundingClientRect()
    const x = ev.clientX
    const y = ev.clientY
    this.mousePos = [x - rect.x, rect.height - y + rect.y]
    this.mouseNorm = [this.mousePos[0] / rect.width, this.mousePos[1] / rect.height]
    this.needUpdate = true
  }

  onMouseDown = (ev: MouseEvent) => {
  }

  onMouseUp = (ev: MouseEvent) => {
  }

  onResize = () => {
    const rect = this.canvasElem.getBoundingClientRect()
    this.res = [rect.width, rect.height]
    this.needUpdate = true
  }

  build = async (args: types.IOArgs, label: string, logger?: Logger): Promise<boolean> => {
    const { canvasId, mouseId } = args as types.ViewportIOArgs
    if (!canvasId) return false

    this.label = label


    // set up DOM events
    const canvasElem = document.getElementById(canvasId)
    if (!canvasElem) {
      logger?.err(`System::IO::Viewport[${canvasId}]`, 'Element not found: ' + canvasId)
      return false
    }
    canvasElem.addEventListener('resize', this.onResize)
    this.canvasElem = canvasElem
    this.onResize()

    const mouseElem = document.getElementById(mouseId)
    if (!mouseElem) {
      logger?.err(`System::IO::Viewport[${mouseId}]`, 'Element not found: ' + mouseId)
      return false
    }
    mouseElem.addEventListener('mousemove', this.onMouseMove)
    mouseElem.addEventListener('mousedown', this.onMouseDown)
    mouseElem.addEventListener('mouseup', this.onMouseUp)
    this.mouseElem = mouseElem


    // canvas texture
    const tex = await CanvasTextureResource.fromId(canvasId, GPU.device, GPU.adapter)
    if (!tex) {
      logger?.err(`System::IO::Viewport[${canvasId}]`, 'Could not contruct texture resource due to previous error')
      return false
    }
    this.texture = tex as CanvasTextureResource


    // mouse buffer
    const fullStructMouse = types.getStructFromModel(this.getNamespace().exported, 'Mouse')
    if (!fullStructMouse) {
      logger?.debug(`System::IO::Viewport[${canvasId}]`, 'Was the namespace changed? Cannot build Mouse struct from namespace.')
      return false
    }

    const mousebuffer = await BufferResource.build({
      bufferBindingType: 'uniform',
      bufferUsageFlags: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: `${this.label}::mouse`,
      layout: fullStructMouse,
    }, GPU.device, logger) as BufferResource


    // res buffer
    const fullStructRes = types.getStructFromModel(this.getNamespace().exported, 'Res')
    if (!fullStructRes) {
      logger?.debug(`System::IO::Viewport[${canvasId}]`, 'Was the namespace changed? Cannot build Res struct from namespace.')
      return false
    }

    const resbuffer = await BufferResource.build({
      bufferBindingType: 'uniform',
      bufferUsageFlags: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: `${this.label}::res`,
      layout: fullStructRes,
    }, GPU.device, logger) as BufferResource


    if (!mousebuffer || !resbuffer) {
      logger?.debug(`System::IO::Viewport[${canvasId}]`, 'Could not contruct buffer resource due to previous error')
      return false
    }

    this.resbuffer = resbuffer
    this.mousebuffer = mousebuffer

    logger?.trace(`System::IO::Viewport[${canvasId}]`, 'Initialization complete')

    return true
  }


  /**
   * Destroys textures, buffers, and removes all event listeners
   * @param logger 
   */
  destroy = (logger?: Logger) => {
    logger?.debug(`System::IO::Viewport[${this.texture.getCanvasId()}]`, 'Destroying')
    this.texture.destroy()
    this.mousebuffer.destroy()
    this.resbuffer.destroy()
    this.mouseElem.removeEventListener('mousemove', this.onMouseMove)
    this.mouseElem.removeEventListener('mousedown', this.onMouseDown)
    this.mouseElem.removeEventListener('mouseup', this.onMouseUp)
    this.canvasElem.removeEventListener('resize', this.onResize)
  }


  getNamespace = (): types.Namespace => {
    const label = this.label
    let ret: types.Namespace = {
      exported: {
        name: `Viewport`,
        definingFileId: `system`,
        dependentFileIds: [],
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
                "kind": "Sint",
                "width": 4
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
                    "offset": 28
                  },
                  {
                    "name": "btn3",
                    "ty": 3,
                    "binding": null,
                    "offset": 32
                  }
                ],
                "span": 40
              }
            }
          },
          {
            "name": null,
            "inner": {
              "Scalar": {
                "kind": "Float",
                "width": 4
              }
            }
          },
          {
            "name": "Res",
            "inner": {
              "Struct": {
                "members": [
                  {
                    "name": "width",
                    "ty": 3,
                    "binding": null,
                    "offset": 0
                  },
                  {
                    "name": "height",
                    "ty": 3,
                    "binding": null,
                    "offset": 4
                  },
                  {
                    "name": "box",
                    "ty": 1,
                    "binding": null,
                    "offset": 8
                  },
                  {
                    "name": "aspect",
                    "ty": 5,
                    "binding": null,
                    "offset": 16
                  }
                ],
                "span": 24
              }
            }
          }
        ],
        namedTypes: {
          "Mouse": 4,
          "Res": 6,
        }
      },
      imported: []
    }
    return ret
  }

  /**
   * 
   * @returns Name => resource map for this viewport
   */
  getResources = (): Record<string, types.Resource> => {
    return {
      "texture": this.texture,
      "mouse": this.mousebuffer,
      "res": this.resbuffer
    }
  }

  onBeginDispatch = (queue: GPUQueue) => {
    if (this.needUpdate) {
      this.mousebuffer.write(
        [
          this.mousePos,    // mouse pixel
          this.mousePos,    // mouse pixel float
          this.mouseNorm,   // mouse normalized
          [this.m1],        // btn1
          [this.m2],        // btn2
          [this.m3]         // btn3
        ],
        queue
      )
      this.resbuffer.write(
        [
          [this.res[0]],              // width
          [this.res[1]],              // height
          this.res,                   // res
          [this.res[0] / this.res[1]] // aspect ratio
        ],
        queue
      )
    }
    this.needUpdate = false
  }
  onEndDispatch = (queue: GPUQueue) => { }
}

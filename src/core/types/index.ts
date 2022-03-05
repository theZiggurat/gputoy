import { Logger } from "@core/recoil/atoms/console"
import { Prisma } from "@prisma/client"

export type GPUInitResult = 'ok' | 'error' | 'incompatible' | 'uninitialized'

export type AttachResult = {
  canvas: HTMLCanvasElement,
  canvasContext: GPUCanvasContext,
  targetTexture: GPUTexture,
  presentationSize: number[],
  preferredFormat: GPUTextureFormat,
}

/**
 * Current status of project
 */
export type ProjectStatus = {
  lastStartTime: number
  lastFrameRendered: number
  dt: number
  frameNum: number
  runDuration: number
  prevDuration: number
  running: boolean
}

export interface Module {
  module: GPUShaderModule
}

export interface Resource {
  label: string
  getBindGroupEntry: (binding: number) => GPUBindGroupEntry
  getBindGroupLayoutEntry: (binding: number, visibility: number) => GPUBindGroupLayoutEntry
  destroy: () => void
}

export type IOType = 'viewport' | 'mouse' | 'keyboard' | 'file'
export type IOArgs = ViewportIOArgs | MouseIOArgs | KeyboardIOArgs | FileIOArgs | StateIOArgs

export type ViewportIOArgs = {
  canvasId: string
}

export type MouseIOArgs = {
  eventTargetId: string
}

export type KeyboardIOArgs = {

}

export type FileIOArgs = {

}

export type StateIOArgs = {

}
export type StateIOMessage = StateIOArgs
/**
 * Holds serializable info about an IO channel
 * These will be created when a component in the react tree
 * uses useIOChannel
 */
export type IOChannel = {
  sourceInstanceId: string
  args: IOArgs
}

/**
 * Handles the io during runtime
 * Created on build from IOSync objects obtained from recoil values
 */
export interface IO {
  type: IOType
  usage: 'read' | 'write' | 'readwrite'
  build: (args: IOArgs, logger?: Logger) => Promise<boolean>
  destroy: (logger?: Logger) => void
  onBeginDispatch: () => void
  onEndDispatch: () => void
  getModels: () => Record<string, Model>
  getResource: () => Resource
}

export type IOConnectorType = 'viewport' | 'file' | 'key' | 'mouse'


export type Rendergraph = {
  passNodes: Record<string, PassNode>
  ioNodes: Record<string, IONode>
  connections: GraphConnector[]
}

export type PassNode = {
  id: string
  label: string
  fileId: string
  passType: 'render' | 'compute'
}



export type IONode = {
  id: string
  mode: 'read' | 'write'
  type: IOConnectorType
  args: any
}

export type GraphNodeType = 'io' | 'pass'
export type GraphConnector = {
  src: {
    type: GraphNodeType,
    id: string
  },
  dst: {
    type: GraphNodeType,
    id: string
  }
}

/**
 * TODO: add mat4, vec4f, vec4i, and rgba
 */
export type ConstructableType = 'int' | 'float' | 'color' | 'vec3f' | 'vec2f' | 'vec3i' | 'vec2i'
export const typeInfo = {
  'int': { size: 4, align: 4, order: 6, glsl: 'int', wgsl: 'i32', writeType: 'int' },
  'float': { size: 4, align: 4, order: 3, glsl: 'float', wgsl: 'f32', writeType: 'float' },
  'color': { size: 12, align: 16, order: 1, glsl: 'vec3', wgsl: 'vec3<f32>', writeType: 'float' },
  'vec3f': { size: 12, align: 16, order: 0, glsl: 'vec3', wgsl: 'vec3<f32>', writeType: 'float' },
  'vec3i': { size: 12, align: 16, order: 4, glsl: 'ivec3', wgsl: 'vec3<i32>', writeType: 'int' },
  'vec2f': { size: 8, align: 8, order: 2, glsl: 'vec2', wgsl: 'vec2<f32>', writeType: 'float' },
  'vec2i': { size: 8, align: 8, order: 5, glsl: 'ivec2', wgsl: 'vec2<i32>', writeType: 'int' },
}

export type Model = {
  name: string,
  definingFileId: string,
  dependentFileIds: string[],
  schema: {
    [key: string]: ConstructableType
  }
}
export type ModelMemLayout = {
  byteSize: number
  byteOffsets: number[]
  writeTypes: ('float' | 'int')[]
  writeSizes: number[]
}
export const getStructDecl = (model: Model, ext: ExtensionShader): string => {
  let decl = []
  decl.push(`struct ${model.name} {`)
  if (ext === 'wgsl') {
    decl.push(Object.entries(model.schema).map(([key, type]) => `\t${key}: ${typeInfo[type].wgsl};`))
  } else {
    decl.push(Object.entries(model.schema).map(([key, type]) => `\t${typeInfo[type].glsl} ${key};`))
  }
  decl.push('};')
  return decl.join('\n')
}

const roundUp = (k: number, n: number) => Math.ceil(n / k) * k
export const getModelMemLayout = (model: Model): ModelMemLayout => {
  let byteSize = 0
  let byteOffsets: number[] = []
  let writeTypes: ('float' | 'int')[] = []
  let writeSizes: number[] = []
  let lastSize = 0
  let align = 0
  Object.values(model.schema).forEach((cType, idx) => {
    byteOffsets[idx] = idx == 0 ? 0 :
      roundUp(typeInfo[cType].align, byteOffsets[idx - 1] + lastSize)
    align = Math.max(align, typeInfo[cType].align)
    const typeSize = typeInfo[cType].size
    byteSize += typeSize
    writeTypes[idx] = typeInfo[cType].writeType as ('float' | 'int')
    writeSizes[idx] = typeSize
    lastSize = typeSize
  })

  let len = byteOffsets.length
  byteSize = roundUp(align, byteOffsets[len - 1] + lastSize)
  return { byteSize, byteOffsets, writeTypes, writeSizes }
}

/**
* Holds data and metadata for single parameter in uniform
*/
export type ParamDesc = {
  paramName?: string,
  paramType: ConstructableType
  param: number[],
  key?: string,
  interface?: number,
  interfaceProps?: any
}


/**
 * File types
 */
const EXT_TEXT = ['wgsl', 'glsl', 'txt', 'md', 'json', 'csv'] as const
const EXT_DATA = ['png', 'jpg', 'mp3'] as const
const EXT_BUFFER = ['png', 'jpg', 'mp3', 'txt', 'csv', 'json'] as const
const EXT_SHADER = ['wgsl', 'glsl'] as const
export type Extension = typeof EXT_TEXT[number] | typeof EXT_DATA[number]
export type ExtensionShader = typeof EXT_SHADER[number]
export type ExtensionData = typeof EXT_DATA[number]
export type ExtensionBuffer = typeof EXT_BUFFER[number]
export type ExtensionText = typeof EXT_TEXT[number]
export const isText = (ext: Extension) => EXT_TEXT.includes(ext as ExtensionText)
export const isData = (ext: Extension) => EXT_DATA.includes(ext as ExtensionData)
export const isBuffer = (ext: Extension) => EXT_BUFFER.includes(ext as ExtensionBuffer)
export const isShader = (ext: Extension) => EXT_SHADER.includes(ext as ExtensionShader)

export type FetchLocation = {
  url?: string,
}

export type File = {
  id: string
  filename: string
  path: string
  data: string
  extension: Extension
  fetch?: FetchLocation,
  metadata: { [key: string]: any }
}

export type Directory = {
  fileId?: string
  c: { [key: string]: Directory }
}

export type PreProcessResult = {
  fileId: string
  // wgsl that is ready for device.createModule()
  processedShader?: string
  // errors returned from pre-processing
  error?: string
}

/**
 * Misc project types
 */
export type MousePos = {
  x: number,
  y: number
}

export type Resolution = {
  width: number,
  height: number,
}
export type Author = {
  id: string,
  name: string | null,
  image: string | null
}

/**
 *  Layout types
 */
export type Locator = 'last-select' | 'depth' | 'depth-inv'
export type Task = {
  sourceId: string,
  message: string,
  targetId?: string,
  targetPanelIndex?: number
  locateBy?: Locator
  args?: any
}

export type InstanceSelector = {
  id: string,
  index?: number
}

/**
 * Passes
 */
export type Pass = {
  label: string
  shaderFileId: string
  deps: any[]
}

export type RenderPass = Pass & {

}

export type ComputePass = Pass & {

}

export type ValidationResult = {

}

export type ValidationError = {

}

/**
 *  Prisma generated types
 */
export const projectQuery = {
  select: {
    id: true,
    title: true,
    description: true,
    type: true,
    params: true,
    graph: true,
    layout: true,
    config: true,
    published: true,
    files: true,
    author: {
      select: {
        name: true,
        id: true,
        image: true,
      }
    },
    forkedFrom: {
      select: {
        id: true,
        title: true
      }
    },
    tags: {
      select: {
        tag: {
          select: {
            name: true
          }
        }
      }
    }
  }
}
const _projectQuery = Prisma.validator<Prisma.ProjectArgs>()(projectQuery)
export type ProjectQuery = Prisma.ProjectGetPayload<typeof _projectQuery>



export const projectQueryMin = {
  select: {
    id: true,
    title: true,
    description: true,
    files: true,
    params: true,
    graph: true,
    createdAt: true,
    author: {
      select: {
        name: true,
        id: true,
        image: true,
      }
    },
    tags: {
      select: {
        tag: {
          select: {
            name: true
          }
        }
      }
    }
  }
}
const _projectQueryMin = Prisma.validator<Prisma.ProjectArgs>()(projectQueryMin)
export type ProjectQueryMin = Prisma.ProjectGetPayload<typeof _projectQueryMin>



export const projectSaveHistory = {
  select: {
    updatedAt: true,
    createdAt: true,
  }
}
const _projectSaveHistory = Prisma.validator<Prisma.ProjectArgs>()(projectSaveHistory)
export type ProjectSaveHistory = Prisma.ProjectGetPayload<typeof _projectSaveHistory>
export type ProjectSaveHistorySerialized = {
  updatedAt: string,
  createdAt: string
}
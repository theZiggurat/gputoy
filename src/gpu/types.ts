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

/**
 * TODO: add mat4, vec4f, vec4i, and rgba
 */
export type ParamType = 'int' | 'float' | 'color' | 'vec3f' | 'vec2f' | 'vec3i' | 'vec2i'

/**
* Holds data and metadata for single parameter in uniform
*/
export type ParamDesc = {
   paramName: string,
   paramType: ParamType
   param: number[]
 }


/**
 * Both languages supported by GPUtoy
 */
export type Lang = 'wgsl' | 'glsl'

/**
 * A single shader file
 */
export type CodeFile = {
    filename: string,
    file: string,
    lang: Lang,
    isRender?: boolean,
}

export type MousePos = {
  x: number,
  y: number
}

export type Resolution = {
  width: number,
  height: number,
}
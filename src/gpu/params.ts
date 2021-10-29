export type ParamType = 'int' | 'float' | 'color'

export interface ParamDesc {
  paramName: string,
  paramType: ParamType
  param: string
}
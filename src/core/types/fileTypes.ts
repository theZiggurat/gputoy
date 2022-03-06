import { FileId } from "."

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
  id: FileId
  filename: string
  path: string
  data: string
  extension: Extension
  fetch?: FetchLocation,
  metadata: { [key: string]: any }
}

// filename => Directory tree
export type Directory = {
  fileId?: FileId
  c: { [key: string]: Directory }
}
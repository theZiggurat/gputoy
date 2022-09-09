import { FileId } from ".";

export type File = {
  id: FileId;
  filename: string;
  path: string;
  data: string;
  extension: Extension;
  fetch?: FetchLocation;
  metadata: { [key: string]: any };
};

/**
 * File types
 */
const EXT_TEXT = ["wgsl", "glsl", "txt", "md", "json", "csv"] as const;
const EXT_DATA = ["png", "jpg", "mp3"] as const;
const EXT_BUFFER = ["png", "jpg", "mp3", "txt", "csv"] as const;
const EXT_SHADER = ["wgsl", "glsl"] as const;
const EXT_VALID = [...EXT_TEXT, ...EXT_DATA, EXT_BUFFER, EXT_SHADER];
export type Extension =
  | typeof EXT_TEXT[number]
  | typeof EXT_DATA[number]
  | "_DIR"
  | "_UNCREATED"
  | "_DIR_UNCREATED"
  | "_DELETED"
  | "_ROOT";
export type ExtensionShader = typeof EXT_SHADER[number];
export type ExtensionData = typeof EXT_DATA[number];
export type ExtensionBuffer = typeof EXT_BUFFER[number];
export type ExtensionText = typeof EXT_TEXT[number];
export const isText = (ext: Extension) =>
  EXT_TEXT.includes(ext as ExtensionText);
export const isData = (ext: Extension) =>
  EXT_DATA.includes(ext as ExtensionData);
export const isBuffer = (ext: Extension) =>
  EXT_BUFFER.includes(ext as ExtensionBuffer);
export const isShader = (ext: Extension) =>
  EXT_SHADER.includes(ext as ExtensionShader);
export const isSupportedFileType = (ext: string) =>
  EXT_VALID.includes(ext as ExtensionShader);

export type FetchLocation = {
  url?: string;
};

/**
 * Recoil data is split between data and everything else (metadata).
 * This is so components that need to watch little things like file name without updating
 * every time the user types a key.
 */
export type FileMetadata = Omit<File, "data">;

// filename => Directory tree
export type Directory = {
  fileId?: FileId;
  c: { [key: string]: Directory };
};

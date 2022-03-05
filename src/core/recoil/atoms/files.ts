import * as types from '@core/types'
import { TypeScriptConfig } from 'next/dist/server/config-shared'
import { atom, atomFamily, DefaultValue, selector } from "recoil"



export const projectFileDataAtom = atomFamily<string, string>({
  key: 'projectFileData',
  default: '',
})

export const projectFileMetadataAtom = atomFamily<Omit<types.File, 'data'>, string>({
  key: 'projectFileMetadata',
  default: {
    filename: 'default',
    path: '/',
    extension: 'wgsl',
    id: '',
    metadata: {}
  },
})

export const projectFilesListAtom = atom<string[]>({
  key: 'projectFiles',
  default: []
})


export const withProjectFilesJSON = selector<{ [key: string]: types.File }>({
  key: 'withProjectFilesJSON',
  get: ({ get }) => {
    let ret: { [key: string]: types.File } = {}
    const fileList = get(projectFilesListAtom)
    for (const fileId of fileList) {
      const fileData = get(projectFileDataAtom(fileId))
      const fileMetadata = get(projectFileMetadataAtom(fileId))
      ret[fileId] = { ...fileMetadata, data: fileData }
    }
    return ret
  },
  set: ({ set, reset }, projectFiles) => {
    Object.entries(projectFiles).forEach(([id, file]) => {
      const { data, ...rest } = file
      set(projectFileDataAtom(id), data)
      set(projectFileMetadataAtom(id), rest)
    })
    set(projectFilesListAtom, Object.keys(projectFiles))
  }
})

export const withProjectFilesMetadata = selector<{ [key: string]: Omit<types.File, 'data'> }>({
  key: 'withProjectFilesMetadata',
  get: ({ get }) => {
    let ret: { [key: string]: Omit<types.File, 'data'> } = {}
    const fileList = get(projectFilesListAtom)
    for (const fileId of fileList) {
      const fileMetadata = get(projectFileMetadataAtom(fileId))
      ret[fileId] = fileMetadata
    }
    return ret
  },
  set: ({ set, reset }, projectFiles) => {
    Object.entries(projectFiles).forEach(([id, file]) => {
      set(projectFileMetadataAtom(id), file)
    })
    set(projectFilesListAtom, Object.keys(projectFiles))
  }
})

export const withFileSetter = selector<types.File>({
  key: 'withFileSetter',
  get: ({ get }) => ({} as types.File),
  set: ({ set, reset }, file) => {
    if (!(file instanceof DefaultValue)) {
      const { data, ...rest } = file
      set(projectFileDataAtom(file.id), data)
      set(projectFileMetadataAtom(file.id), rest)
    }
  }
})


import { projectFileDataAtom, projectFileMetadataAtom, projectFilesListAtom, withFileSetter, withProjectFilesMetadata } from "@core/recoil/atoms/files"
import { useCallback, useMemo } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import * as types from '@core/types'
import { nanoid } from "nanoid"
import * as _fp from "lodash/fp"
import * as _ from "lodash"

export const DEFAULT_FILE: types.File = {
  id: '',
  filename: 'unnamed',
  path: '/',
  data: '',
  extension: 'wgsl',
  metadata: {}
}

export type FileProps = {
  file: types.File,
  setData: (data: string) => void
  setFilename: (filename: string) => void
  setExtension: (extension: types.Extension) => void
  setPath: (path: string) => void
  setMetadata: (key: string, metadata: any) => void
}
export const useFile = (fileId: string): FileProps => {

  const [fileMetadata, setFileMetadata] = useRecoilState(projectFileMetadataAtom(fileId))
  const [fileData, setFileData] = useRecoilState(projectFileDataAtom(fileId))

  const setData = useCallback((data: string) => {
    setFileData(data)
  }, [setFileData])

  const setFilename = useCallback((filename: string) => {
    setFileMetadata(old => ({ ...old, filename }))
  }, [setFileMetadata])

  const setExtension = useCallback((extension: types.Extension) => {
    setFileMetadata(old => ({ ...old, extension }))
  }, [setFileMetadata])

  const setPath = useCallback((path: string) => {
    setFileMetadata(old => ({ ...old, path }))
  }, [setFileMetadata])

  const setMetadata = useCallback((key: string, metadata: any) => {
    setFileMetadata(old => ({ ...old, metadata: { ...old.metadata, [key]: metadata } }))
  }, [setFileMetadata])

  return { file: { ...fileMetadata, data: fileData }, setData, setFilename, setExtension, setPath, setMetadata }

}

export type FileMetadataProps = {
  fileMetadata: Omit<types.File, 'data'>
  setFilename: (filename: string) => void
  setExtension: (extension: types.Extension) => void
  setPath: (path: string) => void
  setMetadata: (key: string, metadata: any) => void
}
export const useFileMetadata = (fileId?: string): FileMetadataProps => {

  const [fileMetadata, setFileMetadata] = useRecoilState(projectFileMetadataAtom(fileId ?? 'default'))

  const setFilename = useCallback((filename: string) => {
    setFileMetadata(old => ({ ...old, filename }))
  }, [setFileMetadata])

  const setExtension = useCallback((extension: types.Extension) => {
    setFileMetadata(old => ({ ...old, extension }))
  }, [setFileMetadata])

  const setPath = useCallback((path: string) => {
    setFileMetadata(old => ({ ...old, path }))
  }, [setFileMetadata])

  const setMetadata = useCallback((key: string, metadata: any) => {
    setFileMetadata(old => ({ ...old, metadata: { ...old.metadata, [key]: metadata } }))
  }, [setFileMetadata])

  return { fileMetadata, setFilename, setExtension, setPath, setMetadata }

}

export type DirectoryProps = {
  directory: types.Directory
  addDirectory: (path?: string, infile?: Omit<types.File, 'id' | 'path'>) => string | undefined
  deleteDirectory: (fileId: string) => boolean
  moveDirectory: (fileId: string, path: string) => boolean
}

/**
 * Hook to handle file structure of 
 */
export const useDirectory = (): DirectoryProps => {

  const setFileIds = useSetRecoilState(projectFilesListAtom)
  const [files, setFiles] = useRecoilState(withProjectFilesMetadata)
  const pushFile = useSetRecoilState(withFileSetter)

  const objectPath = (path: string) => path
    .split('/')
    .filter(s => s.length > 0)
    .flatMap(s => ['c', s])

  const directory: types.Directory = useMemo(() => {
    let ret = { c: {} }
    Object.entries(files).forEach(([fileId, { filename, path }]) => {
      const pathParts = objectPath(path).concat('c', filename)
      // console.log(ret)
      // console.log('adding ', fileId, ' to ', pathParts)
      _.set(ret, pathParts, { fileId })
    })
    return ret
  }, [files])

  const setDirectory = useCallback((directory: types.Directory) => {
    const _collect = (path: string, directory: types.Directory): { [key: string]: string } => {
      const { fileId, c } = directory
      if (fileId)
        return { [fileId]: path }
      let ret = {}
      Object.entries(c).forEach(([name, dir]) => {
        ret = { ...ret, ..._collect(path.concat('/', name), dir) }
      })
      return ret
    }
    const paths = _collect('/', directory)

    setFiles(prev => {
      let newFiles: { [key: string]: Omit<types.File, 'data'> } = {}
      Object.entries(paths).forEach(([fileId, path]) => {
        newFiles[fileId] = { ...prev[fileId], path }
      })
      return newFiles
    })
  }, [setFiles])

  const addDirectory = useCallback((path?: string, infile?: Omit<types.File, 'id' | 'path'>, title?: string): string | undefined => {
    if (infile) {
      const id = nanoid(8)
      const { filename } = infile
      pushFile({ ...infile, id, path })
    } else if (title) {

    }
    return
  }, [pushFile])

  const moveDirectory = (oldpath: string, newpath: string): boolean => {
    const objPath = objectPath(oldpath)
    const chunk = _.get(directory, objPath)
    let newdir = _fp.unset(objPath, directory)
    newdir = _fp.set(objectPath(newpath), chunk)
    setDirectory(newdir)
  }

  const deleteDirectory = (fileId: string, r?: boolean): boolean => {
    setFileIds()
    return false
  }

  return { directory, addDirectory, deleteDirectory, moveDirectory }
}


export const useWorkspace = (instanceId: string) => {

}

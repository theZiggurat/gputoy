import { projectFileDataAtom, projectFileMetadataAtom, projectFilesListAtom, withFileSetter, withProjectFilesMetadata } from "@core/recoil/atoms/files"
import { useCallback, useMemo } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import * as types from '@core/types'
import { nanoid } from "nanoid"
import * as _fp from "lodash/fp"
import * as _ from "lodash"
import useLogger from "./useLogger"

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

  const [fileMetadata, setFileMetadata] = useRecoilState(projectFileMetadataAtom(fileId ?? 'root'))

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
  addFile: (path: string, infile: Omit<types.File, 'id' | 'path'>) => string | undefined
  addDirectory: (path: string, title: string) => string | undefined
  deleteDirectory: (fileId: string, force?: boolean) => boolean
  moveDirectory: (fileId: string, path: string) => boolean
  fileExists: (fileId?: string, filename?: string) => boolean
}

/**
 * Hook to handle file structure of 
 */
export const useDirectory = (): DirectoryProps => {

  const logger = useLogger()
  const files = useRecoilValue(withProjectFilesMetadata)
  const pushFile = useSetRecoilState(withFileSetter)

  const objectPath = (path: string) => path
    .split('/')
    .filter(s => s.length > 0)
    .flatMap(s => ['c', s])


  /**
   * 
   * @param fileId 
   * @param filename 
   * @returns 
   */
  const fileExists = (fileId?: string, filename?: string): boolean => {
    if (fileId) {
      return Object.keys(files)
        .filter(id => types.isSupportedFileType(files[id].extension))
        .includes(fileId)
    }
    return false
  }


  /**
   * 
   */
  const directory: types.Directory = useMemo(() => {
    let ret = { c: {} }
    Object.entries(files).forEach(([fileId, { filename, path }]) => {


      if (files[fileId].extension !== '_DELETED') {
        console.log(files[fileId].filename, files[fileId].path)
        const pathParts = objectPath(path).concat('c', filename)
        ret = _.merge(ret, _fp.set(pathParts, { fileId }, {}))
      }

    })
    return ret
  }, [files])


  /**
   * 
   */
  const addFile = useCallback((path: string, infile: Omit<types.File, 'id' | 'path'>): string | undefined => {
    // add file
    const id = nanoid(8)
    const newfile: types.File = { ...infile, id, path: path ?? '/' }
    if (infile.extension !== '_UNCREATED') {
      for (const file of Object.values(files)) {
        if (file.filename === newfile.filename) {
          logger.err('directory::addFile', `File already exists: ${file.filename}.${file.extension}`)
          return
        }
      }
    }
    pushFile({ id: id, file: newfile })
    return id
  }, [pushFile, files, logger])



  /**
   * 
   */
  const addDirectory = useCallback((path: string, title: string): string | undefined => {
    // add file
    const id = nanoid(8)
    const newfile: types.File = { filename: title, id, path: path, data: '', extension: '_DIR', metadata: { children: 0 } }
    for (const file of Object.values(files)) {
      if (file.filename === newfile.filename) {
        logger.err('directory::addDirectory', `Name taken: ${file.filename}.${file.extension}`)
        return
      }
    }
    pushFile({ id: id, file: newfile })
    return id
  }, [pushFile, files, logger])


  /**
   * 
   * @param oldpath 
   * @param newpath 
   * @returns 
   */
  const moveDirectory = (oldpath: string, newpath: string): boolean => {

    const objPath = objectPath(oldpath)
    const chunk = _.get(directory, objPath)
    const idsInChunk = findAllByKey(chunk, 'fileId')

    const rootDepth = oldpath.split('/').filter(s => s.length > 0).length
    const newPathParts = newpath.split('/').filter(s => s.length > 0 && s !== 'ERROR_IF_SEEN')

    for (const id of idsInChunk) {
      const file = files[id]
      const newPathPartsRelative = file.path.split('/').filter(s => s.length > 0).slice(rootDepth)

      const newPathFull = '/' + newPathParts.concat(newPathPartsRelative).join('/')
      console.log(oldpath, newpath, newPathPartsRelative, newPathParts, newPathFull)
      pushFile({ id: id, file: { path: newpath } })
    }
    return true
  }


  /**
   * 
   * @param fileId 
   * @param force 
   * @returns 
   */
  const deleteDirectory = (fileId: string, force?: boolean): boolean => {

    let targetdir = files[fileId]
    if (!targetdir) return false
    if (force) {
      pushFile({ id: fileId })
      return true
    }
    const filename = targetdir.filename.length == 0 ? '""' : targetdir.filename
    let objpath = objectPath(targetdir.path.concat('/' + filename))
    const chunk = _.get(directory, objpath)
    console.log('CHUNK', chunk, objpath, directory, targetdir)
    const idsInChunk = findAllByKey(chunk, 'fileId')
    console.log('ids in chunk', idsInChunk)
    for (const id of idsInChunk) {
      pushFile({ id })
    }
    return true
  }

  return { directory, addFile, addDirectory, deleteDirectory, moveDirectory, fileExists }
}

// quick and clean. 
// thanks to https://stackoverflow.com/questions/54857222/find-all-values-by-specific-key-in-a-deep-nested-object
function findAllByKey(obj, keyToFind) {
  if (!obj) return []
  return Object.entries(obj)
    .reduce((acc, [key, value]) => (key === keyToFind)
      ? acc.concat(value)
      : (typeof value === 'object')
        ? acc.concat(findAllByKey(value, keyToFind))
        : acc
      , [])
}



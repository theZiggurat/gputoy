import * as types from '@gpu/types'
import { atom, atomFamily, DefaultValue, selector, selectorFamily } from 'recoil'
// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'
import { projectRunStatusAtom } from './controls'

export type FileErrors = {
  [key: string]: number
}
export const projectShaderErrorsAtom = atom<FileErrors>({
  key: 'fileErrors',
  default: {},
})

export const projectShadersAtom = atomFamily<types.CodeFile[], string>({
  key: 'codefiles',
  default: [{ file: defaultShader, filename: 'render', lang: 'wgsl', isRender: true }],
})

export const mousePosAtom = atom<types.MousePos>({
  key: 'mousepos',
  default: {
    x: 0,
    y: 0
  },
})

export const resolutionAtom = atom<types.Resolution>({
  key: 'resolution',
  default: {
    width: 0,
    height: 0,
  },
})

export const projectParamsAtom = atomFamily<types.ParamDesc[], string>({
  key: 'params',
  default: [],
})



export const projectTitleAtom = atomFamily<string, string>({
  key: 'projectTitle',
  default: ''
})

export const currentProjectIDAtom = atom<string>({
  key: 'projectID',
  default: ''
})

export const canvasInitializedAtom = atom<boolean>({
  key: 'canvasInitialized',
  default: false
})

export const withDefaultParams = selector<types.ParamDesc[]>({
  key: 'defaultParams',
  get: ({ get }) => {

    const mouse = get(mousePosAtom)
    const res = get(resolutionAtom)
    const status = get(projectRunStatusAtom)

    return [
      { paramName: 'time', paramType: 'float', param: [status.runDuration] },
      { paramName: 'dt', paramType: 'float', param: [status.dt] },
      { paramName: 'frame', paramType: 'int', param: [status.frameNum] },
      { paramName: 'mouseNorm', paramType: 'vec2f', param: [mouse.x / res.width, mouse.y / res.height] },
      { paramName: 'aspectRatio', paramType: 'float', param: [res.width / res.height] },
      { paramName: 'res', paramType: 'vec2i', param: [res.width, res.height] },
      { paramName: 'mouse', paramType: 'vec2i', param: [mouse.x, mouse.y] },
    ]
  },
})

export const withProjectState = selectorFamily<types.Project, string>({
  key: 'project',
  get: (id) => ({ get }) => {
    const projectTitle = get(projectTitleAtom(id))
    const projectFiles = get(projectShadersAtom(id))
    const projectParams = get(projectParamsAtom(id))

    return {
      title: projectTitle,
      files: projectFiles,
      params: projectParams,
    }
  },
  set: (id) => ({ set, reset }, proj) => {
    if (proj instanceof DefaultValue) {
      reset(projectTitleAtom(id))
      reset(projectShadersAtom(id))
      reset(projectParamsAtom(id))
    } else {
      set(projectTitleAtom(id), proj.title)
      set(projectShadersAtom(id), proj.files)
      set(projectParamsAtom(id), proj.params)
    }
  }
})


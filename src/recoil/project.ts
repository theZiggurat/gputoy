import * as types from '@gpu/types'
import { atom, atomFamily, DefaultValue, selector, selectorFamily } from 'recoil'
// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'
import { projectRunStatusAtom } from './controls'


export const currentProjectIDAtom = atom<string>({
  key: 'projectID',
  default: ''
})

export const projectTitleAtom = atomFamily<{ text: string, isValid: boolean }, string>({
  key: 'projectTitle',
  default: {
    text: 'Unnamed Project',
    isValid: true
  }
})

export const projectDescriptionAtom = atomFamily<{ text: string, isValid: boolean }, string>({
  key: 'projectDescription',
  default: {
    text: '',
    isValid: true
  }
})

export const projectTagsAtom = atomFamily<string[], string>({
  key: 'projectTags',
  default: []
})

export const projectAuthorAtom = atomFamily<string, string>({
  key: 'projectAuthor',
  default: 'anonymous'
})

export const projectShadersAtom = atomFamily<types.CodeFile[], string>({
  key: 'codefiles',
  default: [{ file: defaultShader, filename: 'render', lang: 'wgsl', isRender: true }],
})

export const projectParamsAtom = atomFamily<types.ParamDesc[], string>({
  key: 'params',
  default: [],
})

export const mousePosAtom = atom<types.MousePos>({
  key: 'mousepos',
  default: {
    x: 500,
    y: 500
  },
})

export const resolutionAtom = atom<types.Resolution>({
  key: 'resolution',
  default: {
    width: 0,
    height: 0,
  },
})

export const canvasInitializedAtom = atom<boolean>({
  key: 'canvasInitialized',
  default: false
})

export type FileErrors = {
  [key: string]: number
}
export const projectShaderErrorsAtom = atom<FileErrors>({
  key: 'fileErrors',
  default: {},
})

export const withDefaultParams = selector<types.ParamDesc[]>({
  key: 'defaultParams',
  get: ({ get }) => {

    const mouseFlipped = get(mousePosAtom)
    const res = get(resolutionAtom)
    const status = get(projectRunStatusAtom)

    const mouse = { x: mouseFlipped.x, y: res.height - mouseFlipped.y }

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
    const projectDescription = get(projectDescriptionAtom(id))
    const projectFiles = get(projectShadersAtom(id))
    const projectParams = get(projectParamsAtom(id))

    return {
      title: projectTitle,
      description: projectDescription,
      files: projectFiles,
      params: projectParams,
    }
  },
  set: (id) => ({ set, reset }, proj) => {
    if (proj instanceof DefaultValue) {
      reset(projectTitleAtom(id))
      reset(projectDescriptionAtom(id))
      reset(projectShadersAtom(id))
      reset(projectParamsAtom(id))
    } else {
      set(projectTitleAtom(id), proj.title)
      set(projectDescriptionAtom(id), proj.description)
      set(projectShadersAtom(id), proj.files)
      set(projectParamsAtom(id), proj.params)
    }
  }
})


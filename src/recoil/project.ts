import * as types from '@gpu/types'
import { atom, atomFamily, selector } from 'recoil'
// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'
import { projectRunStatusAtom } from './controls'


export const currentProjectIDAtom = atom<string>({
  key: 'projectID',
  default: ''
})

export const projectTitleAtom = atomFamily<string, string>({
  key: 'projectTitle',
  default: 'Unnamed Project'
})

export const projectDescriptionAtom = atomFamily<string, string>({
  key: 'projectDescription',
  default: '',
})

export const projectTagsAtom = atomFamily<string[], string>({
  key: 'projectTags',
  default: []
})

export const projectAuthorAtom = atomFamily<string, string>({
  key: 'projectAuthor',
  default: 'anonymous'
})

export const projectShadersAtom = atomFamily<types.Shader[], string>({
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


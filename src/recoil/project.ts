import * as types from '@gpu/types'
import { atom, atomFamily, DefaultValue, selector } from 'recoil'
// @ts-ignore
import defaultShader from '../../shaders/basicShader.wgsl'
import { projectRunStatusAtom } from './controls'


export const currentProjectIDAtom = atom<string>({
  key: 'projectID',
  default: 'NOT_SET'
})

export const projectTitleAtom = atom<string | null>({
  key: 'projectTitle',
  default: null
})

export const projectDescriptionAtom = atom<string | null>({
  key: 'projectDescription',
  default: null,
})

export const projectTagsAtom = atom<string[]>({
  key: 'projectTags',
  default: []
})

export const projectAuthorAtom = atom<types.Author | null>({
  key: 'projectAuthor',
  default: null
})

export const projectShadersAtom = atom<types.Shader[]>({
  key: 'projectShaders',
  default: [{ file: defaultShader, filename: 'render', lang: 'wgsl', isRender: true, id: '' }],
})

var _idx = 0
const idx = () => _idx++
export const projectParamsAtom = atomFamily<types.ParamDesc, string>({
  key: 'projectParams',
  default: (key: string) => ({ paramName: undefined, paramType: "int", param: [0], key }),
})

export const projectParamKeys = atom<string[]>({
  key: 'projectParamKeys',
  default: []
})



export const projectForkSource = atom<{ id: string, title: string } | null>({
  key: 'projectForkSource',
  default: null
})

export const projectLastSave = atom<string | null>({
  key: 'projectLastSave',
  default: null
})

export const projectLastSaveLocal = atom<string | null>({
  key: 'projectLastSaveLocal',
  default: null
})

export const projectIsPublished = atom<boolean>({
  key: 'projectIsPublihsed',
  default: false
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

export const withUserParams = selector<types.ParamDesc[]>({
  key: 'userParams',
  get: ({ get }) => {
    const paramKeys = get(projectParamKeys)
    return paramKeys.map(k => get(projectParamsAtom(k)))
  },
  set: ({ set, reset }, params) => {
    if (params instanceof DefaultValue) {
      reset(projectParamKeys)
    } else {
      set(projectParamKeys, params.map(p => p.key!))
      params.forEach(p => {
        set(projectParamsAtom(p.key!), p)
      })
    }
  }
})


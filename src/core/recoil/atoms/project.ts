import * as types from '@core/types'
import { ProjectType } from '@prisma/client'
import generate from 'project-name-generator'
import { atom, atomFamily, DefaultValue, selector } from 'recoil'
import { projectRunStatusAtom } from './controls'
import { withProjectFilesJSON } from './files'
import { withInstanceStateJSON } from './instance'
import { layoutAtom } from './layout'


export const currentProjectIdAtom = atom<string>({
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

export const projectParamsAtom = atomFamily<types.ParamDesc, string>({
  key: 'projectParams',
  default: (key: string) => ({ paramName: undefined, paramType: "int", param: [0], key, interface: 0 }),
})

export const projectParamKeys = atom<string[]>({
  key: 'projectParamKeys',
  default: []
})

export const projectParamInterfaceProps = atomFamily<any, string>({
  key: 'projectParamsInterfaceProps',
  default: {}
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
  key: 'withDefaultParams',
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

export const withParamsJSON = selector<types.ParamDesc[]>({
  key: 'withParamsJSON',
  get: ({ get }) => {
    const paramKeys = get(projectParamKeys)
    return paramKeys.map(k => ({
      ...get(projectParamsAtom(k)),
      interfaceProps: get(projectParamInterfaceProps(k))
    }))
  },
  set: ({ set, reset }, params) => {
    if (params instanceof DefaultValue) {
      reset(projectParamKeys)
    } else {
      set(projectParamKeys, params.map(p => p.key!))
      params.forEach(p => {
        const { interfaceProps, ...param } = p
        set(projectParamsAtom(param.key!), param)
        set(projectParamInterfaceProps(param.key!), interfaceProps)
      })
    }
  }
})

export const withProjectJSON = selector<types.ProjectQuery>({
  key: 'createPageProject',
  get: ({ get }): types.ProjectQuery => {

    const id = get(currentProjectIdAtom)
    const title = get(projectTitleAtom)!
    const description = get(projectDescriptionAtom)
    const author = get(projectAuthorAtom)
    const forkSource = get(projectForkSource)
    const type = ProjectType.DEFAULT

    const params = get(withParamsJSON)
    const files = get(withProjectFilesJSON)
    const tags = get(projectTagsAtom)
    const layout = {
      layout: get(layoutAtom),
      instanceState: get(withInstanceStateJSON)
    }
    const config = {}
    const graph = {}


    return {
      id: id,
      title,
      description,
      params,
      type,
      files,
      layout,
      config,
      graph,
      author,
      published: false,
      tags: tags.map(t => { return { tag: { name: t } } }),
      forkedFrom: forkSource
    }
  },
  set: ({ set, reset }, proj) => {
    if (proj instanceof DefaultValue) {
      reset(currentProjectIdAtom)
      reset(projectTitleAtom)
      reset(projectDescriptionAtom)
      reset(projectAuthorAtom)
      reset(withParamsJSON)
      reset(layoutAtom)
      reset(projectForkSource)
      reset(projectIsPublished)
      reset(withProjectFilesJSON)
    } else {

      set(currentProjectIdAtom, proj.id)
      set(projectTitleAtom, proj.title ?? `${generate().dashed}`)
      set(projectDescriptionAtom, proj.description)
      set(projectAuthorAtom, proj.author)
      set(projectIsPublished, proj.published)
      set(projectForkSource, proj.forkedFrom)

      set(layoutAtom, proj.layout?.layout ?? new DefaultValue())
      set(withInstanceStateJSON, proj.layout?.instanceState ?? new DefaultValue())

      set(withProjectFilesJSON, (proj.files as { [key: string]: types.File }) ?? new DefaultValue())
      set(withParamsJSON, (proj.params as types.ParamDesc[]) ?? [])
    }
  }
})


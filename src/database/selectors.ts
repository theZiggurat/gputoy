import { Lang } from "@gpu/types";
import { layoutAtom } from "@recoil/layout";
import {
  projectTitleAtom,
  projectDescriptionAtom,
  projectAuthorAtom,
  projectShadersAtom,
  projectParamsAtom,
  currentProjectIDAtom,
  projectTagsAtom,
  projectForkSource,
  projectIsPublished,
  withUserParams,
} from "@recoil/project";
import { DefaultValue, selector } from "recoil";
import { CreatePageProjectQuery } from "./args";
import generate from 'project-name-generator'

export const withCreatePageProject = selector<CreatePageProjectQuery>({
  key: 'createPageProject',
  get: ({ get }): CreatePageProjectQuery => {

    const id = get(currentProjectIDAtom)
    const title = get(projectTitleAtom)
    const description = get(projectDescriptionAtom)
    const author = get(projectAuthorAtom)
    const params = JSON.stringify(get(withUserParams))
    const shaders = get(projectShadersAtom).map(s => {
      return {
        source: s.file,
        name: s.filename,
        lang: s.lang,
        isRender: s.isRender ?? false,
        projectId: id,
        id: s.id
      }
    })
    const tags = get(projectTagsAtom)
    const layout = JSON.stringify(get(layoutAtom))
    const config = ""
    const graph = ""
    const forkSource = get(projectForkSource)

    return {
      id: id,
      title,
      description,
      params,
      shaders,
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
      reset(currentProjectIDAtom)
      reset(projectTitleAtom)
      reset(projectDescriptionAtom)
      reset(projectAuthorAtom)
      reset(projectShadersAtom)
      reset(withUserParams)
      reset(layoutAtom)
      reset(projectForkSource)
      reset(projectIsPublished)
      //reset(projectConfigAtom)
      //reset(projectGraphAtom)
    } else {
      set(currentProjectIDAtom, proj.id)
      set(projectTitleAtom, proj.title ?? `${generate().dashed}`)
      set(projectDescriptionAtom, proj.description ?? new DefaultValue())
      set(projectAuthorAtom, proj.author)
      set(layoutAtom, proj.layout ? JSON.parse(proj.layout) : new DefaultValue())
      set(projectForkSource, proj.forkedFrom)
      set(projectIsPublished, proj.published)
      set(projectShadersAtom, proj.shaders ? proj.shaders.map(s => {
        return {
          file: s.source,
          filename: s.name,
          lang: s.lang as Lang,
          isRender: s.isRender,
          id: s.id
        }
      }) : new DefaultValue())
      set(withUserParams, JSON.parse(proj.params ?? '[]'))
    }
  }
})
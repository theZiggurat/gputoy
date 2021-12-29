import { layoutAtom } from "@recoil/layout";
import {
  projectTitleAtom,
  projectDescriptionAtom,
  projectAuthorAtom,
  projectShadersAtom,
  projectParamsAtom,
} from "@recoil/project";
import { DefaultValue, selectorFamily } from "recoil";
import { CreatePageProjectQuery } from "./args";

export const withCreatePageProject = selectorFamily<CreatePageProjectQuery, string>({
  key: 'createPageProject',
  get: (id) => ({ get }): CreatePageProjectQuery => {

    const title = get(projectTitleAtom(id))
    const description = get(projectDescriptionAtom(id))
    const author = get(projectAuthorAtom(id))
    const params = JSON.stringify(get(projectParamsAtom(id)))
    const shaders = get(projectShadersAtom(id)).map(s => {
      return {
        source: s.file,
        name: s.filename,
        lang: s.lang,
        isRender: s.isRender ?? false,
        projectId: id,
        id: ''
      }
    })
    const layout = JSON.stringify(get(layoutAtom))
    const config = ""
    const graph = ""

    return {
      id,
      title,
      description,
      params,
      shaders,
      layout,
      config,
      graph,
      published: false,
      author: {
        name: author,
        id: '',
        image: null
      },

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
      set(projectShadersAtom(id), proj.shaders)
      set(projectParamsAtom(id), proj.params)
    }
  }
})
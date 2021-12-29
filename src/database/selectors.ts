import {
  projectTitleAtom,
  projectDescriptionAtom,
  projectAuthorAtom,
  projectShadersAtom,
  projectParamsAtom,
} from "@recoil/project";
import { DefaultValue, selectorFamily } from "recoil";
import { CreatePageProjectQuery } from "./args";

const withCreatePageProject = selectorFamily<CreatePageProjectQuery, string>({
  key: 'createPageProject',
  get: (id: string) => ({ get }) => {

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
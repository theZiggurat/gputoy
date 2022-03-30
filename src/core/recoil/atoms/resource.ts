import * as types from "@core/types"
import { Resource, ResourceJSON } from "@core/types"
import { atomFamily, atom, DefaultValue, selector } from "recoil"

export const resourceAtom = atomFamily<types.Resource, string>({
  key: 'resource',
  default: (key: string) => ({
    id: key,
    type: 'buffer',
    args: {

    }
  }),
})

export const resourceKeysAtom = atom<string[]>({
  key: 'resourceKeys',
  default: []
})

export const resourceInterfacePropsAtom = atomFamily<any, string>({
  key: 'resourceInterface',
  default: {}
})

export const withResourceJSON = selector<ResourceJSON>({
  key: 'withResourceJSON',
  get: ({ get }) => {
    let ret: ResourceJSON = {}
    for (const key of get(resourceKeysAtom)) {
      ret[key] = get(resourceAtom(key))
    }
    return ret
  },
  set: ({ set, reset }, resources) => {
    if (resources instanceof DefaultValue) {
      reset(resourceKeysAtom)
    } else {
      const keys = Object.keys(resources)
      keys.map(key => set(resourceAtom(key), resources[key]))
      set(resourceKeysAtom, keys)
    }
  }
})

export const withAddResource = selector<Resource>({
  key: 'withAddResource',
  get: ({ }) => ({} as Resource),
  set: ({ set, reset }, resource) => {
    if (resource instanceof DefaultValue) {

    } else {
      set(resourceAtom(resource.id), resource)
      // TODO: be more precautious about ids that will be pushed to recoil system
      set(resourceKeysAtom, old => [...old, resource.id])
    }
  }
})
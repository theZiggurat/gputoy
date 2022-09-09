import * as types from "@core/types";
import { atom, atomFamily, DefaultValue, selector } from "recoil";

export const systemValidationStateAtom = atom<types.SystemValidationState>({
  key: "sys_validstate",
  default: "unvalidated",
});

export const systemBuildStateAtom = atom<types.SystemBuildState>({
  key: "sys_buildstate",
  default: "unbuilt",
});

export const systemFrameStateAtom = atom<types.SystemFrameState>({
  key: "sys_framestate",
  default: types.defaultFrameState,
});

export const systemValidationResultAtom = atomFamily<
  types.ValidationResult | undefined,
  string
>({
  key: "sys_validresult",
  default: undefined,
});

export const systemNamespaceListAtom = atom<string[]>({
  key: "sys_namespacekeys",
  default: [],
});
export const systemNamespaceResultAtom = atomFamily<
  types.Namespace | undefined,
  string
>({
  key: "sys_namespaceresult",
  default: undefined,
});

export const withSystemPrebuildResult = selector<types.SystemPrebuildResult>({
  key: "sys_withprebuild",

  // unused
  get: ({ get }) => ({} as types.SystemPrebuildResult),

  // will be set after every call to System.prebuild
  set: ({ set, reset }, result) => {
    if (result instanceof DefaultValue) return;
    for (const namespaceId of Object.keys(result.namespace)) {
      set(
        systemNamespaceResultAtom(namespaceId),
        result.namespace[namespaceId]
      );
    }
    set(systemNamespaceListAtom, Object.keys(result.namespace));
    for (const fileId of Object.keys(result.validations)) {
      set(systemValidationResultAtom(fileId), result.validations[fileId]);
    }
  },
});

export const withSystemModels = selector<types.Model[]>({
  key: "sys_withmodels",
  get: ({ get }) => {
    return get(systemNamespaceListAtom)
      .map((namespaceId) => get(systemNamespaceResultAtom(namespaceId)))
      .map((namespace) => namespace?.exported)
      .filter((model) => !!model) as types.Model[];
  },
});

export const withSystemNamespace = selector<Record<string, types.Namespace>>({
  key: "sys_namespaces",
  get: ({ get }) => {
    const ret: Record<string, types.Namespace> = {};
    get(systemNamespaceListAtom).forEach((namespaceId) => {
      const namespace = get(systemNamespaceResultAtom(namespaceId));
      if (namespace) ret[namespaceId] = namespace;
    });
    return ret;
  },
});

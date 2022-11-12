import * as types from "@core/types";
import { atom, atomFamily, selector } from "recoil";

export const projectIOProvider = atomFamily<
  types.IOChannel | undefined,
  string
>({
  key: "projectIOProvider",
  default: undefined,
});

export const projectIOKeys = atom<string[]>({
  key: "projectIOKeys",
  default: [],
});

export const withProjectIO = selector<Record<string, types.IOChannel>>({
  key: "withProjectIO",
  get: ({ get }) => {
    const keys = get(projectIOKeys);
    let ret: Record<string, types.IOChannel> = {};
    for (const key of keys) {
      let channel = get(projectIOProvider(key));
      if (channel) ret[key] = channel;
    }
    return ret;
  },
  set: () => {},
});

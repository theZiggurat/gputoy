import * as types from "@core/types";
import { atom } from "recoil";

export const gpuStatusAtom = atom<types.GPUInitResult>({
  key: "gpuStatus",
  default: "uninitialized",
});

export const gpuLimitsAtom = atom<GPUSupportedLimits | undefined>({
  key: "gpuLimits",
  default: undefined,
});

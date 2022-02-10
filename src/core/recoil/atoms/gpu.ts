import { GPUInitResult } from "@core/system/gpu";
import { atom } from "recoil";

export const gpuStatusAtom = atom<GPUInitResult>({
  key: 'gpuStatus',
  default: 'uninitialized',
})
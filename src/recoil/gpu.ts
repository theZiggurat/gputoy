import { GPUInitResult } from "@gpu/gpu";
import { atom } from "recoil";

export const gpuStatusAtom = atom<GPUInitResult>({
  key: 'gpuStatus',
  default: 'uninitialized',
})
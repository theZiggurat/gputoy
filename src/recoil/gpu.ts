import { atom } from "recoil";
import { GPUInitResult } from "../gpu/gpu";

export const gpuStatus = atom<GPUInitResult>({
  key: 'gpuStatus',
  default: 'uninitialized',
})
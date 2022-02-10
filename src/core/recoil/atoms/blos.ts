import { atom } from "recoil";

export const videoUrlAtom = atom<string>({
  key: 'videoURL',
  default: ''
})
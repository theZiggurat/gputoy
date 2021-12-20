import { atom } from "recoil"

export interface Message {
  time: Date,
  type: MessageType,
  header: string,
  body: string
}

export enum MessageType {
  Trace = 0,
  Log = 1,
  Error = 2,
  Fatal = 3,
  Debug = 4,
}

export const consoleAtom = atom<Message[]>({
  key: 'console',
  default: []
})

export type Logger = {
  trace: (header: string, body: string) => void
  log: (header: string, body: string) => void,
  err: (header: string, body: string) => void
  fatal: (header: string, body: string) => void,
  debug: (header: string, body: string) => void,
}
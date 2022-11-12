import { atom } from "recoil";

export interface Message {
  time: Date;
  type: MessageType;
  header: string;
  body: string;
  occurences?: number;
}

export enum MessageType {
  Trace = 1,
  Log = 2,
  Error = 4,
  Fatal = 8,
  Debug = 16,
}

export const consoleAtom = atom<Message[]>({
  key: "console",
  default: [],
});

export type Logger = {
  trace: (header: string, body: string) => void;
  log: (header: string, body: string) => void;
  err: (header: string, body: string) => void;
  fatal: (header: string, body: string) => void;
  debug: (header: string, body: string) => void;
};

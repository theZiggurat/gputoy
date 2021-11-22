import { atom, useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil"

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
  Fatal = 3
}

const _console = atom<Message[]>({
  key: 'console',
  default: []
})

export type Logger = {
  trace: (header: string, body: string) => void
  log: (header: string, body: string) => void,
  err: (header: string, body: string) => void
  fatal: (header: string, body: string) => void,
}

export const useLogger = (): Logger => {
  const setConsole = useSetRecoilState(_console)
  
  const trace = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Trace, time: new Date() }])
  }
  const log = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Log, time: new Date() }])
  }
  const err = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Error, time: new Date() }])
  }
  const fatal = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Fatal, time: new Date() }])
  }

  return {
    trace,
    log,
    err,
    fatal
  }
}

export const useConsole = (levels: boolean[], keywordFilter: string): Message[] => {
  const consoleState = useRecoilValue(_console)

  return consoleState
    .filter(msg => levels[msg.type])
    .filter(msg => 
      msg.header.match(new RegExp(keywordFilter, 'i')) || 
      msg.body.match(new RegExp(keywordFilter, 'i'))
    )
}

export const clearConsole = () => {
  const clear = useResetRecoilState(_console)
  return clear
}
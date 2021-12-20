import { consoleAtom, MessageType } from "@recoil/console"
import { useSetRecoilState } from "recoil"

export default () => {
  const setConsole = useSetRecoilState(consoleAtom)

  const trace = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Trace, time: new Date() }])
  }
  const log = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Log, time: new Date() }])
    console.log(header, body)
  }
  const err = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Error, time: new Date() }])
    console.warn(header, body)
  }
  const fatal = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Fatal, time: new Date() }])
    console.error(header, body)
  }
  const debug = (header: string, body: string) => {
    setConsole(old => [...old, { header, body, type: MessageType.Debug, time: new Date() }])
  }

  return {
    trace,
    log,
    err,
    fatal,
    debug
  }

}
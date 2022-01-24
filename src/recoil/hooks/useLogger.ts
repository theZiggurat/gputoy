import { consoleAtom, MessageType } from "@recoil/console"
import { useRecoilState } from "recoil"

const useLogger = () => {
  const [console, setConsole] = useRecoilState(consoleAtom)

  const isLastMessage = (message: string): boolean => {
    const compare = console[console.length - 1]
    if (!compare) return false
    return compare.body == message
  }

  const pushToConsole = (header: string, body: string, type: MessageType) => {
    if (isLastMessage(body))
      setConsole(old => {
        const newConsole = [...old]
        // const replace = newConsole[newConsole.length - 1]
        // newConsole[newConsole.length - 1] = { ...replace, occurences: (replace.occurences ?? 0) + 1 }
        return newConsole
      })
    else
      setConsole(old => [...old, { header, body, type, time: new Date() }])
  }

  const trace = (header: string, body: string) => pushToConsole(header, body, MessageType.Trace)
  const log = (header: string, body: string) => pushToConsole(header, body, MessageType.Log)
  const err = (header: string, body: string) => pushToConsole(header, body, MessageType.Error)
  const fatal = (header: string, body: string) => pushToConsole(header, body, MessageType.Fatal)
  const debug = (header: string, body: string) => pushToConsole(header, body, MessageType.Debug)

  return {
    trace,
    log,
    err,
    fatal,
    debug
  }

}

export default useLogger
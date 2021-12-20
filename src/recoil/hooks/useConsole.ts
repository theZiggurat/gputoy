import { consoleAtom, Message } from "@recoil/console"
import { useRecoilValue, useResetRecoilState } from "recoil"

export default (levels: boolean[], keywordFilter: string): Message[] => {
  const consoleState = useRecoilValue(consoleAtom)

  return consoleState
    .filter(msg => levels[msg.type])
    .filter(msg =>
      msg.header.match(new RegExp(keywordFilter, 'i')) ||
      msg.body.match(new RegExp(keywordFilter, 'i'))
    )
}

export const useClearConsole = () => {
  const clear = useResetRecoilState(consoleAtom)
  return clear
}
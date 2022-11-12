import { consoleAtom, Message } from "core/recoil/atoms/console";
import { useRecoilValue, useResetRecoilState } from "recoil";

const useConsole = (levels: boolean[], keywordFilter: string): Message[] => {
  const consoleState = useRecoilValue(consoleAtom);

  const level = levels.reduce((sum, l, idx) => sum + (l ? 0x1 << idx : 0), 0);

  return consoleState
    .filter((msg) => !!(msg.type & level))
    .filter(
      (msg) =>
        msg.header.match(new RegExp(keywordFilter, "i")) ||
        msg.body.match(new RegExp(keywordFilter, "i"))
    );
};

export default useConsole;

export const useClearConsole = () => {
  const clear = useResetRecoilState(consoleAtom);
  return clear;
};

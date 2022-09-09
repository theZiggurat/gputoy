import { consoleAtom, MessageType } from "core/recoil/atoms/console";
import { useRecoilState } from "recoil";

const useLogger = () => {
  const [consoleState, setConsole] = useRecoilState(consoleAtom);

  const isLastMessage = (message: string): boolean => {
    const compare = consoleState[consoleState.length - 1];
    if (!compare) return false;
    return compare.body == message;
  };

  const pushToConsole = (header: string, body: string, type: MessageType) => {
    setConsole((old) => [...old, { header, body, type, time: new Date() }]);
  };

  const trace = (header: string, body: string) =>
    pushToConsole(header, body, MessageType.Trace);
  const log = (header: string, body: string) =>
    pushToConsole(header, body, MessageType.Log);
  const err = (header: string, body: string) =>
    pushToConsole(header, body, MessageType.Error);
  const fatal = (header: string, body: string) =>
    pushToConsole(header, body, MessageType.Fatal);
  const debug = (header: string, body: string) =>
    pushToConsole(header, body, MessageType.Debug);

  return {
    trace,
    log,
    err,
    fatal,
    debug,
  };
};

export default useLogger;

export interface Message {
  type: MessageType,
  header: string,
  body: string
}

enum MessageType {
  Trace = 0,
  Log = 1,
  Error = 2,
  Fatal = 3
}

class _Console {

  private buffer: Message[] = []
  private onMessage: () => void = () => {}

  constructor() {

  } 

  trace = (header: string, body: string) => {
    this.buffer.push({
      type: MessageType.Trace,
      header: header,
      body: body
    })
    this.onMessage()
  }

  log = (header: string, body: string) => {
    this.buffer.push({
      type: MessageType.Log,
      header: header,
      body: body
    })
    this.onMessage()
  }

  err = (header: string, body: string)=> {
    this.buffer.push({
      type: MessageType.Error,
      header: header,
      body: body
    })
    this.onMessage()
  }

  fatal = (header: string, body: string)=> {
    this.buffer.push({
      type: MessageType.Fatal,
      header: header,
      body: body
    })
    this.onMessage()
  }

  setOnMessage = (onMsg: () => void) => {
    this.onMessage = onMsg
  }

  getBuffer = (): Message[] => {
    return this.buffer
  }



}

const Console = new _Console()
export default Console
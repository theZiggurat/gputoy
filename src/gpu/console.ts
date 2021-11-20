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

class _Console {

  private buffer: Message[] = []
  private onMessage: () => void = () => {}


  constructor() {

  } 

  trace = (header: string, body: string) => {
    this.buffer.push({
      time: new Date(),
      type: MessageType.Trace,
      header: header,
      body: body
    })
    this.onMessage()
  }

  log = (header: string, body: string) => {
    this.buffer.push({
      time: new Date(),
      type: MessageType.Log,
      header: header,
      body: body
    })
    this.onMessage()
  }

  err = (header: string, body: string)=> {
    this.buffer.push({
      time: new Date(),
      type: MessageType.Error,
      header: header,
      body: body
    })
    this.onMessage()
  }

  fatal = (header: string, body: string)=> {
    this.buffer.push({
      time: new Date(),
      type: MessageType.Fatal,
      header: header,
      body: body
    })
    this.onMessage()
  }

  clear = () => {
    this.buffer = []
    this.onMessage()
  }

  getFiltered = (typeFilter: boolean[], keywordFilter: string): Message[] => this.buffer.filter(line => 
    typeFilter[line.type] && (
      line.header.match(new RegExp(keywordFilter, 'i')) || 
      line.body.match(new RegExp(keywordFilter, 'i')))
  )
  getBuffer = (): Message[] => this.buffer
  setOnMessage = (onMsg: () => void) => this.onMessage = onMsg

}

const Console = new _Console()
export default Console
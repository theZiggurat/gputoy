class _Console {

  private log: string[] = []
  private onMessage: () => void = () => {}

  constructor() {

  } 

  push = (msg: string) => {
    this.log.push(msg)
    this.onMessage()
  }

  setOnMessage = (onMsg: () => void) => {
    this.onMessage = onMsg
  }



}

const Console = new _Console()
export default Console
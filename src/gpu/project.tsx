class Project {

  lastStartTime: number = 0
  lastFrameRendered: number = 0
  dt: number = 0
  frameNum: number = 0

  runDuration: number = 0

  running: boolean = false

  render: (() => void) | null = null
  
  constructor() {
    this.render = () => {}
  }

  run() {
    if (!this.render || this.running) return

    this.lastStartTime = Date.now()

    this.running = true
    this.renderInternal()
  }

  renderInternal() {
    if (!this.running) return
    
    this.render!()
    
    let now = Date.now()
    this.dt = now - this.lastFrameRendered
    this.lastFrameRendered = now
    ++this.frameNum

    window.requestAnimationFrame(this.renderInternal)
  }

  pause() {
    this.running = false
  }

  stop() {
    this.running = false
    this.initBuffers()
  }

  initBuffers() {

  }

}

export default Project;
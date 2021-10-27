import {ParamDesc, ParamType} from './params'

interface ProjcetSerializable {

}

class Project {

  // run state
  lastStartTime: number = 0
  lastFrameRendered: number = 0
  dt: number = 0
  frameNum: number = 0
  runDuration: number = 0
  running: boolean = false

  // project state
  uniforms: ParamDesc[] = []

  status: string = 'Ok'

  render: (() => void) = () => {}
  
  constructor() {

  }

  run = () => {
    if (!(this.render) || this.running) return

    this.lastStartTime = Date.now()

    this.running = true
    this.status = 'Running'
    this.renderInternal()
  }

  renderInternal = () => {
    if (!this.running) return
    
    this.render!()
    
    let now = Date.now()
    this.dt = now - this.lastFrameRendered
    this.lastFrameRendered = now
    ++this.frameNum

    window.requestAnimationFrame(this.renderInternal)
  }

  pause = () => {
    this.status = 'Paused'
    this.running = false
  }

  stop = () => {
    this.status = '--'
    this.running = false
    this.frameNum = 0

    this.initBuffers()
  }

  updateUniforms = (params: ParamDesc[]) => {
    this.uniforms.splice(0, this.uniforms.length, ...params)

  }

  initBuffers = () => {

  }

}

const WorkingProject = new Project()
export default WorkingProject;
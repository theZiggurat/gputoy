import { SetterOrUpdater } from 'recoil'
import init, {
  compile_glsl,
  get_module_info,
  get_ir,
  get_errors
} from '../../../pkg/naga_compiler'
import { Logger } from 'core/recoil/atoms/console'
import { FileErrors } from 'core/recoil/atoms/project'
import { Shader } from '../types'
import staticdecl from './staticdecl'

type ShaderStage = 'vertex' | 'fragment' | 'compute'

class Compiler {

  static _instance: Compiler

  static instance = (): Compiler => {
    if (Compiler._instance === undefined)
      Compiler._instance = new Compiler()
    return Compiler._instance
  }

  private ready: boolean = false

  // compileWGSL?: (device: GPUDevice, src: CodeFile, decls: string, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>) => GPUShaderModule | null
  // compileGLSL?: (device: GPUDevice, src: string, stage: ShaderStage, logger: Logger) => GPUShaderModule | null

  compileWGSL = async (device: GPUDevice, src: Shader, decls: string, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): Promise<GPUShaderModule | null> => {
    if (setFileErrors) setFileErrors({})
    let fullsrc = staticdecl.vertex.concat(decls.concat(src.file))
    logger?.debug("NAGA COMPILER", fullsrc)

    //device.pushErrorScope('validation')
    const module = device.createShaderModule({
      code: fullsrc
    })
    //const err = await device.popErrorScope()

    //if (err == null) return module
    return module

    //let declLen = decls.split(/\r\n|\r|\n/).length
    // let numStr = err.message.match(/\d+(?=:)/g)[0]
    // let newNumStr = (numStr - declLen + 1).toString()
    // let message: string = err.message.replace(/\d+(?=:)/g, newNumStr)
    // message = message.substr(0, message.indexOf('^') + 1)
    // logger?.err('NAGA COMPILER', message)
    // if (setFileErrors) setFileErrors(old => {
    //   let n = { ...old }
    //   n[src.filename] = Number(newNumStr)
    //   return n
    // })
    //return null
  }

  compileGLSL = async (device: GPUDevice, src: Shader, decls: string, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): Promise<GPUShaderModule | null> => {

    if (!this.isReady) {
      logger?.err('NAGA COMPILER', 'Compiler not ready')
      return null
    }
    let fullsrc = decls.concat(staticdecl.glslLayout.concat(src.file))
    logger?.debug('NAGA COMPILER', fullsrc)
    let fragSrc = compile_glsl(fullsrc, 'fragment')

    // gentle massage
    fragSrc = fragSrc?.replace('[[location(0)]] pos: vec4<f32>, [[location(1)]] uv: vec2<f32>', 'in: VertexOutput')
    fragSrc = fragSrc?.replaceAll(/pos(?!_)/gm, 'in.position')
    fragSrc = fragSrc?.replaceAll(/uv(?!_)/gm, 'in.uv')

    //logger?.log('NAGA COMPILER', vertSrc ?? 'no vertex source')
    //logger?.log('NAGA COMPILER', fragSrc ? staticdecl.vertex.concat(fragSrc) : 'no fragment source')

    if (fragSrc === undefined) return null

    device.pushErrorScope('validation')
    const module = device.createShaderModule({
      code: staticdecl.vertex.concat(fragSrc)
    })
    const err = await device.popErrorScope()
    if (err == null) return module
    logger?.err('NAGA COMPILER', err.message)

    return null
  }

  constructor() {
    init().then(() => {
      this.ready = true
    })
  }
  isReady = (): boolean => this.ready

  collectErrors = () => {

  }
}

export default Compiler
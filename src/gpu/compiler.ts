import { SetterOrUpdater } from 'recoil'
import init, {
  compile_glsl, 
  compile_wgsl, 
  get_module_info,
  get_ir,
  get_errors
} from '../../pkg/naga_compiler'
import { Logger } from '../recoil/console'
import { FileErrors } from '../recoil/project'
import { CodeFile } from './types'

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

  compileWGSL = async (device: GPUDevice, src: CodeFile, decls: string, logger?: Logger, setFileErrors?: SetterOrUpdater<FileErrors>): Promise<GPUShaderModule | null> => {
    if (setFileErrors) setFileErrors({})
    let fullsrc = decls.concat(src.file)

    device.pushErrorScope('validation')
      const module = device.createShaderModule({
        code: fullsrc
      })
    const err = await device.popErrorScope()

    if (err == null) return module

    let declLen = decls.split(/\r\n|\r|\n/).length
    let numStr = err.message.match(/\d+(?=:)/g)[0]
    let newNumStr = (numStr - declLen + 1).toString()
    let message: string = err.message.replace(/\d+(?=:)/g, newNumStr)
    message = message.substr(0, message.indexOf('^')+1)
    logger?.err('NAGA COMPILER', message)
    if (setFileErrors) setFileErrors(old => {
      let n = {...old}
      n[src.filename] = Number(newNumStr)
      return n
    })
    return null
  }

  constructor() {
    init().then(() => {

      // this.compileGLSL = (device: GPUDevice, src: string, stage: ShaderStage, logger: Logger): GPUShaderModule | null => {
      //   let module = compile_glsl(src, stage as string)
      //   if (module) {
      //     //logger.debug('NAGA-COMPILER -- IR', get_ir())
      //     return device.createShaderModule({
      //       code: module
      //     })
      //   } else {
      //     let errors: string[] = JSON.parse(get_errors())
      //     errors.forEach(err => logger.err('NAGA COMPILER', err));
      //     return null
      //   }
      // }

      this.ready = true
      //Console.trace('Compiler', 'Compiler ready')
    })
  }
  isReady = (): boolean => this.ready
  
  collectErrors = () => {

  }
}

export default Compiler
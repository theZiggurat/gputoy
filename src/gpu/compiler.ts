import init, {
  compile_glsl, 
  compile_wgsl, 
  get_module_info,
  get_ir,
  get_errors
} from '../../naga-compiler/pkg/naga_compiler'
import { Logger } from '../recoil/console'

type ShaderStage = 'vertex' | 'fragment' | 'compute'

class _Compiler {

  private ready: boolean = false

  compileWGSL?: (device: GPUDevice, src: string, logger: Logger) => GPUShaderModule | null
  compileGLSL?: (device: GPUDevice, src: string, stage: ShaderStage, logger: Logger) => GPUShaderModule | null

  constructor() {
    init().then(() => {
      this.compileWGSL = (device: GPUDevice, src: string, logger: Logger): GPUShaderModule | null => {
        let module = compile_wgsl(src)
        if (module) {
          //logger.debug('NAGA-COMPILER -- IR', get_ir())
          return device.createShaderModule({
            code: module
          })
        }else {
          //logger.err('NAGA_COMPILER', get_errors())
          let errors: string[] = JSON.parse(get_errors())
          errors.forEach(err => logger.err('NAGA COMPILER', err));
          return null
        }
      }

      this.compileGLSL = (device: GPUDevice, src: string, stage: ShaderStage, logger: Logger): GPUShaderModule | null => {
        let module = compile_glsl(src, stage as string)
        if (module) {
          //logger.debug('NAGA-COMPILER -- IR', get_ir())
          return device.createShaderModule({
            code: module
          })
        } else {
          let errors: string[] = JSON.parse(get_errors())
          errors.forEach(err => logger.err('NAGA COMPILER', err));
          return null
        }
      }

      this.ready = true
      //Console.trace('Compiler', 'Compiler ready')
    })
  }
  isReady = (): boolean => this.ready
}

const Compiler = new _Compiler()
export default Compiler
import init, {
  compile_glsl, 
  compile_wgsl, 
  get_module_info,
  get_ir,
  get_errors
} from '../../naga-compiler/pkg/naga_compiler'
import Console from './console'

type ShaderStage = 'vertex' | 'fragment' | 'compute'

class _Compiler {

  private ready: boolean = false

  compileWGSL?: (device: GPUDevice, src: string) => GPUShaderModule | null
  compileGLSL?: (device: GPUDevice, src: string, stage: ShaderStage) => GPUShaderModule | null

  constructor() {
    init().then(() => {
      this.compileWGSL = (device: GPUDevice, src: string): GPUShaderModule | null => {
        let module = compile_wgsl(src)
        if (module) {
          //Console.trace('NAGA-COMPILER -- IR', get_ir())
          return device.createShaderModule({
            code: module
          })
        }else {
          let errors: string[] = JSON.parse(get_errors())
          errors.forEach(err => Console.err('NAGA COMPILER', err));
          return null
        }
      }

      this.compileGLSL = (device: GPUDevice, src: string, stage: ShaderStage): GPUShaderModule | null => {
        let module = compile_glsl(src, stage as string)
        if (module) {
          //Console.trace('NAGA-COMPILER -- IR', get_ir())
          return device.createShaderModule({
            code: module
          })
        } else {
          let errors: string[] = JSON.parse(get_errors())
          errors.forEach(err => Console.err('NAGA COMPILER', err));
          return null
        }
      }

      this.ready = true
      Console.trace('Compiler', 'Compiler ready')
    })
  }
  isReady = (): boolean => this.ready
}

const Compiler = new _Compiler()
export default Compiler
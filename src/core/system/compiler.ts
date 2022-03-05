import { SetterOrUpdater } from 'recoil'
import init, {
  compile_glsl,
  get_module_info,
  get_ir,
  get_errors,
  introspect
} from '../../../pkg/naga_compiler'
import { Logger } from 'core/recoil/atoms/console'
import { FileErrors } from 'core/recoil/atoms/project'
import staticdecl from './staticdecl'
import { getStructDecl, File, Model, ExtensionShader, Module, PreProcessResult } from '@core/types'

const REGEX_SYNCS = /@sync\s+var\s*<?([\w+\s*,\s*]*)>?\s+(\w*)\s*:\s*(\w+)\s*<?([\w+\s*,\s*]*)>?\s*/gm
const REGEX_ENTRY = /@stage\((\w+)\)[^{]*/gm
// matches @model declarations and captures struct name
const REGEX_CAPTURE_MODELS = /@model\s+struct\s+([a-zA-Z]+)\s*{\s*([^}]*)\s*};/gm
// matches @sync declarations
const REGEX_REPLACE_SYNC = /@sync\s+/g
const REGEX_REPLACE_MODEL = /@model\s+/g
class Compiler {

  static _instance: Compiler

  static instance = (): Compiler => {
    if (Compiler._instance === undefined)
      Compiler._instance = new Compiler()
    return Compiler._instance
  }

  private ready: boolean = false

  findModels = (device: GPUDevice, file: File, logger?: Logger): Record<string, Model> => {
    let input = file.data
    const matches = input.matchAll(REGEX_CAPTURE_MODELS)
    for (const match of matches) {
      const { input, index } = match
      const modelName = match[1]
      const inner = match[2]
      console.log(input)
      // const {
      //   types,
      //   constants,
      //   global_variables,
      //   functions,
      //   entry_points
      // } = JSON.parse(introspect(input, file.extension, "") ?? "{}")
    }
    return {}
  }

  validate = (file: File, models: Record<string, Model>, logger?: Logger): PreProcessResult => {

    // regex the shader string to remove gputoy defined declarations
    let processedShader = file.data
    // model names need to be fetched before the tag is removed
    processedShader = processedShader.replaceAll(REGEX_REPLACE_MODEL, '')
    // invalid group and bindings are not caught by the parser, so this will let us label the 
    // global variables we should remember
    processedShader = processedShader.replaceAll(REGEX_REPLACE_SYNC, '@group(999) @binding(999)')

    // add struct definitions back to the shaders that used a definition from another file
    for (const model of Object.values(models)) {
      const matches = processedShader.match(model.name)
      if (matches) {
        processedShader = [getStructDecl(model, file.extension as ExtensionShader), processedShader].join('\n')
      }
    }

    // run wasm module to parse shader string to naga IR output
    const {
      types,
      constants,
      global_variables,
      functions,
      entry_points
    } = JSON.parse(introspect(processedShader, file.extension, "") ?? "{}")

    if (!types) {
      const errors = get_errors()
      logger?.err('Compiler::Preprocessor', 'Pre-processing failed due to: \n'.concat(errors))
      return {
        fileId: file.id,
        error: errors,
      }
    }

    for (const type of types) {
      console.log(type)
    }

    for (const constant of constants) {
      console.log(constant)
    }


    return {
      fileId: file.id,
      processedShader
    }
  }

  compile = async (
    device: GPUDevice,
    src: File,
    decls: string,
    models: Record<string, Model>,
    logger?: Logger
  ): Promise<Module | null> => {

    if (!this.isReady) return null

    const preprocessResult = this.validate(src, models, logger)
    if (!preprocessResult) return null

    const { processedShader } = preprocessResult

    console.log(processedShader)
    // const module = device.createShaderModule({
    //   code: fullsrc
    // })

    // const compilationInfo = await module.compilationInfo()
    // console.log(compilationInfo.messages)

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
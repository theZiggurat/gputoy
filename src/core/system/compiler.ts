import init, {
  get_errors,
  introspect
} from '../../../pkg/naga_compiler'
import { Logger } from 'core/recoil/atoms/console'
import { getStructDecl, File, Model, ExtensionShader, Module, PreProcessResult, NagaType, Namespace, Dependency, getTypeDecl, getStructFromModel, ValidationResult } from '@core/types'

const REGEX_SYNCS = /@sync\s+var\s*<?([\w+\s*,\s*]*)>?\s+(\w*)\s*:\s*(\w+)\s*<?([\w+\s*,\s*]*)>?\s*/gm
const REGEX_ENTRY = /@stage\((\w+)\)[^{]*/gm
// matches @model declarations and captures struct raw src
const REGEX_CAPTURE_MODELS = /(?<=@model\s*)[^}]*/gm
// matches @sync declarations
const REGEX_REPLACE_SYNC = /@sync\s+/g
const REGEX_REPLACE_MODEL = /@model\s+/g
const REGEX_REPLACE_BRING_STATEMENT = /@bring\s+([a-zA-Z_][_a-zA-Z0-9]*)\s*;/gm
const REGEX_REPLACE_BRING_INLINE = /@bring\s+([a-zA-Z_][_a-zA-Z0-9]*)\s*/gm

const REGEX_CAPTURE_BRING = /(@bring\s+([a-zA-Z_][a-zA-Z0-9]*)\s*;)|(:\s*@bring\s+([a-zA-Z_][a-zA-Z0-9]*)\s*)/gm

class Compiler {

  static _instance: Compiler

  static instance = (): Compiler => {
    if (Compiler._instance === undefined)
      Compiler._instance = new Compiler()
    return Compiler._instance
  }

  private ready: boolean = false




  /**
   * 
   * @param file 
   * @param logger 
   * @returns 
   */
  findModel = (file: File, logger?: Logger): Model | undefined => {

    // remove comments
    let input = file.data.replaceAll(/^\s*\/\/.*$/gm, '')

    let matches = [...input.matchAll(REGEX_CAPTURE_MODELS)]
      .map(m => m[0].concat('};'))
      .filter(m => !!m)
      .join('\n')

    // just a quirk that the naga parser needs an entry point to parse while a wgsl does not
    if (file.extension === 'glsl') {
      matches = matches.concat('\nvoid main(){}')
    }

    const { types } = JSON.parse(introspect(matches, file.extension, "fragment") ?? "{}")
    if (!types) {
      logger?.err(`Compiler::find_models[${file.filename}]`, `Validation of model failed due to: \n`.concat(get_errors()))
      return undefined
    }
    let namedTypes: Record<string, number> = {}
    let indexedTypes = []

    // the json exported from naga uses 1-based indexing
    // for the types within the indexedTypes array
    let idx = 1
    for (const type of types) {
      if (type.name)
        namedTypes[type.name] = idx
      indexedTypes.push(type)
      idx++
    }

    return {
      name: file.filename,
      definingFileId: file.id,
      dependentFileIds: [],
      namedTypes,
      indexedTypes
    }
  }




  /**
   * 
   * @param file 
   * @param logger 
   * @returns 
   */
  findDeps = (file: File, logger?: Logger): Dependency[] => {

    // remove comments 
    let input = file.data.replaceAll(/^\s*\/\/.*$/gm, '')

    let matches = input.matchAll(REGEX_CAPTURE_BRING)
    let ret = []

    for (const match of [...matches]) {
      if (!!match[2]) {
        ret.push({
          identifier: match[2],
          inline: false
        })
      } else if (!!match[4]) {
        ret.push({
          identifier: match[4],
          inline: true
        })
      }
    }
    return ret
  }




  /**
   * 
   * @param file 
   * @param globalNamespace 
   * @param logger 
   * @returns 
   */
  validate = (
    file: File,
    globalNamespace: Record<string, Namespace>,
    logger?: Logger
  ): ValidationResult => {

    // regex the shader string to remove gputoy defined declarations
    let processedShader = file.data
    // all exported types were already obtained. Remove the attribute
    processedShader = processedShader.replaceAll(REGEX_REPLACE_MODEL, '')
    // invalid group and bindings are not caught by the parser, so this will let us label the 
    // global variables that need group and binding assignments
    processedShader = processedShader.replaceAll(REGEX_REPLACE_SYNC, '@group(999) @binding(999) ')

    // replace bring declarations with their corresponding declarations in other files
    // fails validate if declaration not found in namespace
    const localNamespace = globalNamespace[file.id]
    for (const dep of localNamespace.imported) {
      let fileModel!: Model
      let foundModel = false
      for (const fileId of Object.keys(globalNamespace)) {
        if (fileId === file.id) continue

        fileModel = globalNamespace[fileId].exported
        if (!!fileModel.namedTypes[dep.identifier]) {
          foundModel = true
          break
        }
      }
      if (!foundModel) {
        const error = `Type does not exist in global namespace: ${dep.identifier}`
        logger?.err(`Compiler::Preprocessor[${file.filename}]`, error)
        return {
          fileId: file.id,
          errors: error,
        }
      }
      let fullStruct = getStructFromModel(fileModel, dep.identifier)
      if (!fullStruct) {
        const error = `Issue combining types to full struct: ${dep.identifier}`
        logger?.err(`Compiler::Preprocessor[${file.filename}]`, error)
        return {
          fileId: file.id,
          errors: error,
        }
      }
      let typeSrc = getStructDecl(fullStruct, file.extension as ExtensionShader)
      if (dep.inline) {
        processedShader = [typeSrc, processedShader.replaceAll(new RegExp(`@bring\\s+${dep.identifier}`, 'g'), dep.identifier)].join('\n')
      } else {
        processedShader = processedShader.replaceAll(new RegExp(`@bring\\s+${dep.identifier}\\s*;`, 'g'), typeSrc)
      }
    }

    console.log(processedShader)

    // now processedShader has all dependent types baked in
    // ready for naga validation
    const nagaModule = JSON.parse(introspect(processedShader, file.extension, "") ?? "{}")

    if (!nagaModule.types) {
      const errors = get_errors()
      logger?.err(`Compiler::Preprocessor[${file.filename}]`, 'Pre-processing failed due to: \n'.concat(errors))
      return {
        fileId: file.id,
        errors: errors,
      }
    }

    return {
      fileId: file.id,
      processedShader,
      nagaModule
    }
  }

  compile = async (
    device: GPUDevice,
    file: File,
    source: string
  ): Promise<GPUShaderModule | null> => {

    const module = device.createShaderModule({
      label: file.filename,
      code: source,
    })

    const compilationInfo = await module.compilationInfo()
    for (const message of compilationInfo.messages) {
      console.log('COMPILATION MESSAGE FOR ', file.filename, message)
      return null
    }


    return module
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
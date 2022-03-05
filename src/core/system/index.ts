import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import Compiler from './compiler'
import GPU from './gpu'
import { ViewportIO } from './io'

class System {


  private static _instance?: System

  static instance = (): System => {
    if (System._instance === undefined) {
      System._instance = new System()
    }

    return System._instance
  }

  static destroy = () => {
    this._instance?._destroy()
    this._instance = undefined
  }

  _destroy = () => {
    Object.values(this.resources).forEach(r => r.destroy())
    this.resources = {}
    Object.values(this.modules).forEach(r => { })
    this.modules = {}
  }

  reset = () => {
    this._destroy()
  }

  gpuAttach!: types.AttachResult
  resizeNeeded: boolean = false
  resizeSize: number[] = [0, 0]

  graph: types.Rendergraph = {
    passNodes: {
      "p1": {
        id: "p1",
        label: 'mainPass',
        fileId: "gq2tY1",
        passType: 'render'
      },
    },
    ioNodes: {
      "canvas": {
        id: "canvas",
        mode: "write",
        type: "viewport",
        args: {
          canvasId: 'canvas_tnW3sdwF'
        }
      }
    },
    connections: [
      {
        src: { type: 'pass', id: 'p1' },
        dst: { type: 'io', id: 'canvas' }
      },
    ]
  }

  isValidated: boolean = false
  isBuilt: boolean = false

  // file id => file
  files: Record<string, types.File> = {}
  // file id => boolean
  fileNeedCompile: Record<string, boolean> = {}
  // file id => boolean
  fileNeedPreprocess: Record<string, boolean> = {}
  // file id => process result
  processedFiles: Record<string, types.PreProcessResult> = {}


  // model name => model
  models: Record<string, types.Model> = {}
  // model name => boolean
  modelNeedRebuild: Record<string, boolean> = {}



  resources: Record<string, types.Resource> = {}




  io: Record<string, types.IO> = {
  }



  // pass key => module
  modules: Record<string, types.Module> = {}
  // pass key => boolean
  moduleNeedRebuild: Record<string, boolean> = {}



  build = async (logger?: Logger): Promise<boolean> => {

    // test statement
    const x = new ViewportIO()
    const result = await x.build({ canvasId: 'canvas_tnW3sdwF' }, logger)

    logger?.trace('test', result ? 'true' : 'false')

    logger?.trace('System::build', 'Build initiated')

    if (!this.graph) {
      logger?.err('System::build', 'No render graph. Aborting.')
      return false
    }

    logger?.debug('System::build', 'BUILD_IO')
    if (!(await this.buildIo(logger))) {
      logger?.err('System::build', 'Failed to build io nodes due to above error')
      return false
    }
    logger?.debug('System::build', 'BUILD_IO -- COMPLETE')

    logger?.debug('System::build', 'VALIDATE')
    if (!(await this.validate(logger))) {
      return false
    }
    logger?.debug('System::build', 'VALIDATE -- COMPLETE')

    logger?.debug('System::build', 'BUILD_MODULES')
    if (!(await this.buildModules(logger))) {
      return false
    }
    logger?.debug('System::build', 'BUILD_MODULES -- COMPLETE')

    logger?.debug('System::build', 'BUILD_PASSES')
    if (!(await this.buildPasses(logger))) {
      return false
    }
    logger?.debug('System::build', 'BUILD_PASSES -- COMPLETE')

    return false
  }

  validate = async (logger?: Logger, stopOnError?: boolean): Promise<boolean> => {

    const { passNodes, ioNodes } = this.graph

    if (!this.buildModels(logger)) {
      return false
    }

    const filesToUpdate = Object.values(passNodes)
      .map(p => p.fileId)
      .filter(id => this.fileNeedPreprocess[id])

    let passedValidation = true
    for (const fileId of filesToUpdate) {

      const file = this.files[fileId]
      const preprocessResult = await Compiler.instance().validate(file, this.models, logger)
      this.processedFiles[fileId] = preprocessResult

      // keep mark on file as dirty
      // fail validation for entire run
      if (preprocessResult.error) {
        logger?.err(`System::validate`, `Validation failed for ${file.filename}.${file.extension} due to above error`)

        if (!stopOnError) return false
        passedValidation = false
        continue
      }

      // mark file as clean
      this.fileNeedPreprocess[fileId] = false
      logger?.debug(`System::validate`, `Validation complete for ${file.filename}.${file.extension}`)
    }

    return passedValidation
  }


  /**
   * First round of pre-processor:
   * IF file needs pre-processing, rebuild model
   * FOR every model rebuilt, check old for 
   * @param logger optional logging
   * @returns  true/false if models were built
   */
  buildModels = async (logger?: Logger): Promise<boolean> => {
    const { passNodes, ioNodes } = this.graph

    let newModels = { ...this.models }

    // delete models that come from dirty files
    for (const modelKey of Object.keys(this.models)) {
      const sourceFile = this.models[modelKey].definingFileId
      if (this.fileNeedPreprocess[sourceFile]) {
        delete newModels[modelKey]
      }
    }

    // obtain models from io nodes in graph
    for (const key of Object.keys(ioNodes)) {
      const node = ioNodes[key]
      const io = this.io[node.id]

      if (!io) {
        logger?.err(`System::build_models`, `IO not found. id: ${key}`)
        return false
      }
      const ioModels = io.getModels()
      for (const key of Object.keys(ioModels)) {

      }
    }

    // obtain models from passes in graph
    for (const key of Object.keys(passNodes)) {
      const node = passNodes[key]
      console.log(key, node)
      const file = this.files[node.fileId]



      if (!file || !types.isShader(file?.extension ?? '')) {
        logger?.err(`System::build_models`, `File not found. id: ${key}`)
        return false
      }

      if (this.fileNeedPreprocess[file.id] ?? true) {
        const fileModels = Compiler.instance().findModels(GPU.device, file, logger)
        for (const modelKey of Object.keys(fileModels)) {
          const oldModel = this.models[modelKey]
          if (oldModel) {

          }
        }

        this.fileNeedPreprocess[file.id] = false
      }
    }




    return true
  }

  buildModules = async (logger?: Logger): Promise<boolean> => {
    const { passNodes, decl } = this.graph
    // 
    let modules: Record<string, types.Module> = {}
    //let moduleCache: Record<string, types.Module> = {}
    for (const key of Object.keys(passNodes)) {
      const node = passNodes[key]
      const file = this.files[node.fileId]
      //let cachedModule = moduleCache[node.fileId]
      //const hasCurrentModule = !!this.modules[]
      if (this.fileNeedCompile[node.fileId] ?? true) {
        const module = await Compiler.instance().compile(GPU.device, file, "", this.models, logger)

        // errors have been ommited during compilation
        if (!module) return false

        modules[key] = module
        this.fileNeedCompile[node.fileId] = false
      } else {
        modules[key] = this.modules[key]
      }
    }
    this.modules = modules
    return true
  }


  buildIo = async (logger?: Logger): Promise<boolean> => {
    const { ioNodes } = this.graph
    return true
  }

  buildPasses = async (logger?: Logger): Promise<boolean> => {
    const { passNodes } = this.graph
    return false
  }

  pushFileDelta = (delta: Record<string, types.File>, removed: string[], logger?: Logger) => {
    // overwrite/append file deltas, and set the delta'd files as dirty
    this.files = { ...this.files, ...delta }
    Object.keys(delta).forEach(fileId => {
      this.fileNeedPreprocess[fileId] = true
      this.fileNeedCompile[fileId] = true
    })

    // delete removed files
    for (const fileId in removed) {
      delete this.files[fileId]
      delete this.fileNeedPreprocess[fileId]
      delete this.fileNeedCompile[fileId]
    }

    // if there was any change, signal a rebuild is needed
    if (Object.keys(delta).length > 0 || removed.length > 0) {
      this.isBuilt = false
      this.isValidated = false
    }
  }

  pushIoDelta = (io: types.IO) => {

  }

  dispatch = (logger?: Logger) => {

    const commandEncoder = GPU.device.createCommandEncoder()

    GPU.device.queue.submit([commandEncoder.finish()])
  }





}

export default System

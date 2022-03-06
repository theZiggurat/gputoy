import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import { IOChannel } from '@core/types'
import { intersection, isEqual, union } from 'lodash'
import { uniq } from 'lodash/fp'
import Compiler from './compiler'
import GPU from './gpu'
import { MouseIO, ViewportIO } from './io'

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
          canvasId: 'viewport_rIal-o6i'
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
  files: Record<types.FileId, types.File> = {}
  // file id => boolean
  fileNeedCompile: Record<types.FileId, boolean> = {}
  // file id => boolean
  fileNeedPreprocess: Record<types.FileId, boolean> = {}
  // file id => process result
  processedFiles: Record<types.FileId, types.PreProcessResult> = {}

  // file id => namespace
  namespace: Record<types.FileId, types.Namespace> = {}
  // file id => boolean
  namespaceNeedsRebuild: Record<types.FileId, boolean> = {}


  resources: Record<string, types.Resource> = {}







  // channelId => channel
  // all available io channels fed in from react world using pushIODelta().
  availChannels: Record<types.ChannelId, types.IOChannel> = {}

  /**
      Table to track which io's need to be built before any utilization by the system
        -   set by pushIODelta()
        -   unset by successful buildIO() calls if the given IO is needed within the project configuration.
            i.e. within the channel lock or found as a candidate
   */
  ioNeedRebuild: Record<types.ChannelId, boolean> = {}

  ioNeedRebuildNamespace: Record<types.ChannelId, boolean> = {}

  // channelId => io
  // instances of IO class
  // subset of availChannels with resources ready to be used
  activeChannels: Record<types.ChannelId, types.IO> = {}

  // graph.ioNodes.key => channelId
  // ioNodes without a channel lock will search for the
  // best candidate in availChannels
  channelLock: Record<types.ChannelNodeId, types.ChannelId> = {}



  // pass key => module
  modules: Record<string, types.Module> = {}
  // pass key => boolean
  moduleNeedRebuild: Record<string, boolean> = {}



  build = async (logger?: Logger): Promise<boolean> => {

    logger?.trace('System::build', 'Build initiated')

    if (!this.graph) {
      logger?.err('System::build', 'No render graph. Aborting.')
      return false
    }

    logger?.debug('System::build', 'BUILD_IO')
    if (!(await this.buildIo(logger))) {
      return false
    }
    logger?.debug('System::build', 'BUILD_IO -- COMPLETE')

    logger?.debug('System::build', 'BUILD_NAMESPACE')
    if (!(await this.buildNamespaces(logger))) {
      return false
    }
    logger?.debug('System::build', 'BUILD_NAMESPACE -- COMPLETE')

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


  /**
   * 
   * @param logger 
   * @returns 
   */
  buildIo = async (logger?: Logger): Promise<boolean> => {
    const { ioNodes } = this.graph

    for (const ioKey of Object.keys(ioNodes)) {

      const { args, type } = ioNodes[ioKey]
      let channelId = this.channelLock[ioKey]
      let foundChannel!: IOChannel
      if (channelId) {
        if (this.ioNeedRebuild[channelId] === false) {
          logger?.trace(`System::build_io[${ioKey}]`, `Skipping rebuild io at channel: ${channelId}`)
          continue
        }
        logger?.trace(`System::build_io[${ioKey}]`, `Rebuilding io at channel: ${channelId}`)
        foundChannel = this.availChannels[channelId]
      }

      if (!foundChannel) {
        let candidates = Object.values(this.availChannels)
          .filter(ch => ch.ioType === type)
          .filter(ch => !this.activeChannels[ch.id])

        if (candidates.length === 0) {
          logger?.err(`System::build_io[${ioKey}]`, 'No IO channel availible for building')
          return false
        }

        // find one with the same arguments, or default to the first one availible
        foundChannel = candidates.find(ch => isEqual(ch.args, args)) ?? candidates[0]
      }

      let newIO: types.IO | undefined = undefined
      switch (foundChannel.ioType) {
        case 'viewport': {
          newIO = new ViewportIO()
          if (!(newIO.build(foundChannel.args, foundChannel.label, logger))) {
            logger?.err(`System::build_io::viewport[${foundChannel.id}]`, `IO build failed`)
            return false
          }
          break
        }
        case 'mouse': {
          newIO = new MouseIO()
          if (!(newIO.build(foundChannel.args, foundChannel.label, logger))) {
            logger?.err(`System::build_io::mouse[${foundChannel.id}]`, `IO build failed`)
            return false
          }
          break
        }
        default: {
          logger?.err('System::build_io', `Unknown io type: ${foundChannel.ioType}`)
          return false
        }
      }
      if (newIO) {
        this.activeChannels[foundChannel.id] = newIO
        this.channelLock[ioKey] = foundChannel.id
        this.ioNeedRebuild[foundChannel.id] = false
        this.ioNeedRebuildNamespace[foundChannel.id] = true
      }
    }
    return true
  }

  /**
   * 
   * @param logger 
   * @returns 
   */
  buildNamespaces = async (logger?: Logger): Promise<boolean> => {

    let namespaces: Record<string, types.Namespace> = {}

    Object.keys(this.activeChannels).filter(ch => this.ioNeedRebuildNamespace[ch]).forEach(ch => {
      const io = this.activeChannels[ch]
      const label = io.label
      let localNamespace = io.getNamespace()
      namespaces[ch] = localNamespace
      this.ioNeedRebuildNamespace[ch] = false
      logger?.debug('System::build_namespaces', `Namespace rebuilt for io: ${label}`)
    })

    Object.keys(this.files).filter(fileId => this.namespaceNeedsRebuild[fileId] ?? true).forEach(fileId => {

      const file = this.files[fileId]
      const model = Compiler.instance().findModel(file, logger)
      if (!model) {
        logger?.err('System::build_namespaces', `Failed to make model in ${file.filename}.${file.extension}.`)
        return
      }

      const deps = Compiler.instance().findDeps(file, logger)
      if (!deps) {
        logger?.err('System::build_namespaces', `Failed to find dependencies in ${file.filename}.${file.extension}.`)
        return
      }

      namespaces[fileId] = {
        exported: model,
        imported: deps
      }

      this.namespaceNeedsRebuild[fileId] = false
      this.fileNeedPreprocess[fileId] = true
      logger?.debug('System::build_namespaces', `Namespace rebuilt for file: ${file.filename}.${file.extension}`)
    })

    this.namespace = { ...this.namespace, ...namespaces }
    return true
  }


  /**
   * 
   * @param logger 
   * @param stopOnError 
   * @returns 
   */
  validate = async (logger?: Logger, stopOnError?: boolean): Promise<boolean> => {

    const { passNodes, ioNodes } = this.graph

    if (!this.buildNamespaces(logger)) {
      return false
    }

    const filesToPreprocess = Object.values(passNodes)
      .map(p => p.fileId)
      .filter(id => this.fileNeedPreprocess[id] ?? true)

    let passedValidation = true
    for (const fileId of filesToPreprocess) {
      const file = this.files[fileId]
      logger?.trace(`System::validate[${fileId}]`, `Validation started for ${file.filename}.${file.extension}`)

      const preprocessResult = Compiler.instance().validate(file, this.namespace, logger)
      this.processedFiles[fileId] = preprocessResult

      // keep mark on file as dirty
      // fail validation for entire run
      if (preprocessResult.error) {
        logger?.err(`System::validate[${fileId}]`, `Validation failed for ${file.filename}.${file.extension} due to above error`)

        if (!stopOnError) return false
        passedValidation = false
        continue
      }

      // mark file as clean
      this.fileNeedPreprocess[fileId] = false
      this.fileNeedCompile[fileId] = true
      logger?.trace(`System::validate[${fileId}]`, `Validation complete for ${file.filename}.${file.extension}`)
    }

    return passedValidation
  }

  buildModules = async (logger?: Logger): Promise<boolean> => {
    const { passNodes } = this.graph
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

    let namespaceEntriesToRemove = []

    // delete removed files
    for (const fileId in removed) {
      delete this.files[fileId]
      delete this.fileNeedPreprocess[fileId]
      delete this.fileNeedCompile[fileId]
      delete this.namespaceNeedsRebuild[fileId]

      let namespace = this.namespace[fileId]
      if (namespace) {
        namespaceEntriesToRemove.push(Object.keys(namespace.exported))
      }
      delete this.namespace[fileId]
      logger?.debug('System::push_file_delta', `file deleted: ${fileId}`)
    }

    namespaceEntriesToRemove = uniq(namespaceEntriesToRemove.flat())

    // any namespaces containing imports with these names will 
    // be set dirty
    for (const fileId of Object.keys(this.files)) {
      let namespace = this.namespace[fileId]
      if (namespace) {
        if (intersection(namespaceEntriesToRemove, namespace.imported.map(dep => dep.identifier)).length > 0) {
          this.namespaceNeedsRebuild[fileId] = true
        }
      }
    }

    logger?.debug('System::push_file_delta', `Namespaces invalidated: ${namespaceEntriesToRemove}`)

    // if there was any change, signal a rebuild is needed
    if (Object.keys(delta).length > 0 || removed.length > 0) {
      this.isBuilt = false
      this.isValidated = false
    }
  }

  pushIoDelta = (delta: Record<string, types.IOChannel>, removed: string[], logger?: Logger) => {
    // update the dictionary of availible io channels
    this.availChannels = { ...this.availChannels, ...delta }
    for (const key of Object.keys(delta)) this.ioNeedRebuild[key] = true

    for (const removedKey of removed) {
      let io = this.activeChannels[removedKey]
      if (io) {
        io.destroy()
        delete this.activeChannels[removedKey]
      }
      delete this.availChannels[removedKey]
      delete this.ioNeedRebuild[removedKey]
      for (const ioKey of Object.keys(this.graph.ioNodes)) {
        if (this.channelLock[ioKey] === removedKey) {
          delete this.channelLock[ioKey]
        }
      }
      logger?.debug('System::push_io_delta', `IO destroyed. key = ${removedKey}`)
    }

    if (Object.keys(delta).length > 0 || removed.length > 0) {
      this.isBuilt = false
      this.isValidated = false
    }

  }

  dispatch = async (logger?: Logger) => {

    if (!this.isValidated || !this.isBuilt) {
      logger?.trace('System::dispatch', 'Forced to rebuild during dispatch.')
      if (!(await this.build(logger))) {
        return
      }
    }

    const { passNodes, ioNodes, connections } = this.graph

    const commandEncoder = GPU.device.createCommandEncoder()
    for (const ioKey of Object.keys(ioNodes)) {
      let io
    }

    GPU.device.queue.submit([commandEncoder.finish()])
  }





}

export default System

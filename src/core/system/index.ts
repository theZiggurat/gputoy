import { Logger } from '@core/recoil/atoms/console'
import * as types from '@core/types'
import { IOChannel } from '@core/types'
import { intersection, isEqual } from 'lodash'
import { uniq } from 'lodash/fp'
import Compiler from './compiler'
import GPU from './gpu'
import { ViewportIO } from './io'
import { QuadPipeline } from './pipeline'
import BufferResource from './resource/bufferResource'

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

  resizeNeeded: boolean = false
  resizeSize: number[] = [0, 0]

  isValidated: boolean = false
  isBuilt: boolean = false

  // file id => file
  files: Record<types.FileId, types.File> = {}

  // file id => process result
  processedFiles: Record<types.FileId, types.ValidationResult> = {}
  // file id => boolean
  fileNeedPreprocess: Record<types.FileId, boolean> = {}

  // file id | io id => namespace
  namespace: Record<types.FileId, types.Namespace> = {
    "Pipeline::Quad[static]": QuadPipeline.getNamespace(),
    "System::Frame": frameStateNamespace
  }
  // file id | io id => boolean
  namespaceNeedsRebuild: Record<types.FileId, boolean> = {}

  // file id => compiled shader module
  modules: Record<string, GPUShaderModule> = {}
  // file id => boolean
  moduleNeedCompile: Record<types.FileId, boolean> = {}


  resources: Record<string, types.Resource> = {}

  currentRunnerFileId: string = ""
  runner: any
  runnerNeedValidation: boolean = false

  // channelId => channel
  // all available io channels fed in from react world using pushIODelta().
  availChannels: Record<types.ChannelId, types.IOChannel> = {}

  /**
      Table to track which io's need to be built before any utilization by the system
        -   set by pushIODelta()
        -   unset by successful buildIO() calls if the given IO is needed within the project configuration.
            i.e. within the channel lock or found as a candidate
   */
  ioNeedBuild: Record<types.ChannelId, boolean> = {}

  ioNeedBuildNamespace: Record<types.ChannelId, boolean> = {}

  // channelId => io
  // instances of IO class
  // subset of availChannels with resources ready to be used
  activeChannels: Record<types.ChannelId, types.IO> = {}

  // graph.ioNodes.key => channelId
  // ioNodes without a channel lock will search for the
  // best candidate in availChannels
  channelLock: Record<types.ChannelNodeId, types.ChannelId> = {}


  pipelines: types.Pipeline[] = []

  frameStateBuffer!: BufferResource

  resolveResource = (path?: string, logger?: Logger): types.Resource | undefined => {
    if (!path) return undefined
    const split = path.split('::')
    const [domain, name, key] = split
    if (!domain || !name) {
      logger?.err('System::resolve', 'Invalid path: ' + path)
      return undefined
    }
    if (domain === 'system') {
      if (name !== 'frame') {
        logger?.err('System::resolve', 'Resource does not belong to system: ' + name)
        return undefined
      }
      return this.frameStateBuffer
    }
    if (domain === 'bus') {
      let channel = this.activeChannels[this.channelLock[name]]
      if (!channel) {
        logger?.err('System::resolve', 'IO Channel not found: ' + name)
        return undefined
      }
      let resource = channel.getResources()[key ?? '_']
      if (!resource) {
        logger?.err('System::resolve', 'Resource does not exist in io: ' + key)
      }
      return resource
    }

    return undefined
  }

  prebuild = async (logger?: Logger): Promise<types.SystemPrebuildResult | undefined> => {
    if (this.isValidated) {
      return {
        namespace: this.namespace,
        validations: this.processedFiles
      }
    }

    logger?.trace('System::prebuild', 'Build initiated')
    logger?.debug('System::prebuild', 'CHECK_RUN')
    if (!this.checkRunner(logger)) {
      return
    }
    logger?.debug('System::prebuild', 'CHECK_RUN -- COMPLETE')

    logger?.debug('System::prebuild', 'BUILD_NAMESPACE')
    if (!(await this.buildNamespaces(logger))) {
      return
    }
    logger?.debug('System::prebuild', 'BUILD_NAMESPACE -- COMPLETE')

    logger?.debug('System::prebuild', 'VALIDATE')
    if (!(await this.validate(logger))) {
      return
    }
    logger?.debug('System::prebuild', 'VALIDATE -- COMPLETE')

    this.isValidated = true
    return {
      namespace: this.namespace,
      validations: this.processedFiles
    }
  }



  build = async (logger?: Logger): Promise<boolean> => {

    if (!this.isValidated) {
      logger?.err('System::build', 'Cannot build, validation failed in previous step.')
      return false
    }

    if (this.isBuilt) {
      return true
    }

    let framebuf = await BufferResource.build({
      bufferBindingType: 'uniform',
      bufferUsageFlags: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'sys_framestate_buffer',
      layout: types.getStructFromModel(frameStateNamespace.exported, 'Frame')!,
    }, GPU.device, logger)
    if (!framebuf) {
      logger?.err('System::prebuild', 'Failed to build frame state buffer')
      return false
    }
    this.frameStateBuffer = framebuf as BufferResource

    logger?.debug('System::prebuild', 'BUILD_IO')
    if (!(await this.buildIo(logger))) {
      return false
    }
    logger?.debug('System::prebuild', 'BUILD_IO -- COMPLETE')

    logger?.debug('System::build', 'BUILD_MODULES')
    if (!(await this.buildModules(logger))) {
      return false
    }
    logger?.debug('System::build', 'BUILD_MODULES -- COMPLETE')

    this.isBuilt = true
    return true
  }

  checkRunner = (logger?: Logger): boolean => {
    if (this.runner && !this.runnerNeedValidation) {
      return true
    }
    let jsonFile = this.currentRunnerFileId ? this.files[this.currentRunnerFileId] : undefined
    if (!jsonFile) {
      jsonFile = Object.values(this.files).find(f => f.extension === 'json' && f.metadata['valid'])
      if (!jsonFile) {
        logger?.err("System::check_runner", 'No valid json files to create runner from.')
        return false
      }
      logger?.log("System::check_runner", `Runner not set, defaulting to ${jsonFile?.filename}.json`)
      this.currentRunnerFileId = jsonFile.id
    }

    try {
      this.runner = JSON.parse(jsonFile.data)
    } catch (err) {
      logger?.err('System::check_runner', 'Exception thrown when parsing json: '.concat(err.toString()))
      return false
    }
    return true
  }


  /**
   * 
   * @param logger 
   * @returns 
   */
  buildIo = async (logger?: Logger): Promise<boolean> => {

    const bus = this.runner.bus

    for (const [ioName, io] of Object.entries(bus)) {

      let channelId = this.channelLock[ioName]
      let foundChannel!: IOChannel
      if (channelId) {
        if (this.ioNeedBuild[channelId] === false) {
          logger?.trace(`System::build_io[${ioName}]`, `Skipping rebuild io at channel: ${channelId}`)
          continue
        }
        logger?.trace(`System::build_io[${ioName}]`, `Rebuilding io at channel: ${channelId}`)
        foundChannel = this.availChannels[channelId]
      }

      if (!foundChannel) {
        let candidates = Object.values(this.availChannels)
          .filter(ch => ch.ioType === io.type)
          .filter(ch => !this.activeChannels[ch.id])

        if (candidates.length === 0) {
          logger?.err(`System::build_io[${ioName}]`, 'No IO channel availible for building')
          return false
        }

        // TODO: make args
        const args = {}

        // find one with the same arguments, or default to the first one availible
        foundChannel = candidates.find(ch => isEqual(ch.args, args)) ?? candidates[0]
      }

      let newIO: types.IO | undefined = undefined
      switch (foundChannel.ioType) {
        case 'viewport': {

          newIO = new ViewportIO()
          if (!(await newIO.build(foundChannel.args, foundChannel.label, logger))) {

            logger?.err(`System::build_io::viewport[${foundChannel.id}]`, `IO build failed`)
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
        this.channelLock[ioName] = foundChannel.id
        this.ioNeedBuild[foundChannel.id] = false
        this.ioNeedBuildNamespace[foundChannel.id] = true
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

    const ioToBuildNamespace = Object.keys(this.availChannels)
      .filter(ch => this.namespaceNeedsRebuild[ch] ?? true)

    for (const ch of ioToBuildNamespace) {
      const io = this.availChannels[ch]
      const type = io.ioType
      switch (type) {
        case 'viewport': {
          namespaces['viewport'] = new ViewportIO().getNamespace()
          break
        }
      }
      this.ioNeedBuildNamespace[ch] = false
      logger?.debug('System::build_namespaces', `Namespace rebuilt for bus::${io.label}`)
    }

    const filesToRebuildNamespace = Object.values(this.files)
      .filter(f => types.isShader(f.extension) && (this.namespaceNeedsRebuild[f.id] ?? true))
      .map(f => f.id)

    for (const fileId of filesToRebuildNamespace) {

      const file = this.files[fileId]
      const model = Compiler.instance().findModel(file, logger)
      if (!model) {
        logger?.err('System::build_namespaces', `Failed to make model in ${file.filename}.${file.extension}.`)
        continue
      }

      const deps = Compiler.instance().findDeps(file, logger)
      if (!deps) {
        logger?.err('System::build_namespaces', `Failed to find dependencies in ${file.filename}.${file.extension}.`)
        continue
      }

      namespaces[fileId] = {
        exported: model,
        imported: deps
      }

      this.namespaceNeedsRebuild[fileId] = false
      this.fileNeedPreprocess[fileId] = true
      logger?.debug('System::build_namespaces', `Namespace rebuilt for file: ${file.filename}.${file.extension}`)
    }

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

    const filesToPreprocess = Object.values(this.files)
      .filter(f => types.isShader(f.extension) && (this.fileNeedPreprocess[f.id] ?? true))
      .map(f => f.id)

    let passedValidation = true
    for (const fileId of filesToPreprocess) {
      const file = this.files[fileId]
      logger?.trace(`System::validate[${fileId}]`, `Validation started for ${file.filename}.${file.extension}`)

      const validationResult = Compiler.instance().validate(file, this.namespace, logger)
      this.processedFiles[fileId] = validationResult

      // keep mark on file as dirty
      // fail validation for entire run
      if ('errors' in validationResult) {
        logger?.err(`System::validate[${fileId}]`, `Validation failed for ${file.filename}.${file.extension} due to above error`)

        if (!stopOnError) return false
        passedValidation = false
        continue
      }

      // mark file as clean
      this.fileNeedPreprocess[fileId] = false
      this.moduleNeedCompile[fileId] = true
      logger?.trace(`System::validate[${fileId}]`, `Validation complete for ${file.filename}.${file.extension}`)
    }

    this.isValidated = passedValidation
    return passedValidation
  }

  /**
   * 
   * @param logger 
   * @returns 
   */
  buildModules = async (logger?: Logger): Promise<boolean> => {

    const { bus, runs } = this.runner

    let pipelines: types.Pipeline[] = []
    for (const run of runs) {
      switch (run.type) {
        case 'quad': {
          const quadPipeline = new QuadPipeline()
          let success = await quadPipeline.build(
            GPU.device,
            run,
            this.modules,
            this.moduleNeedCompile,
            this.files,
            this.processedFiles,
            this.resolveResource,
            logger
          )
          if (!success) {
            return false
          }
          pipelines.push(quadPipeline)
          break
        }
        case 'render': {
          break
        }
        case 'compute': {
          break
        }
      }
    }
    this.pipelines = pipelines

    return true
  }


  /**
   * 
   * @param delta 
   * @param removed 
   * @param logger 
   */
  pushFileDelta = (delta: Record<string, types.File>, removed: string[], logger?: Logger) => {
    // overwrite/append file deltas, and set the delta'd files as dirty
    this.files = { ...this.files, ...delta }
    Object.keys(delta).forEach(fileId => {
      const file = this.files[fileId]
      if (types.isShader(file.extension))
        this.namespaceNeedsRebuild[fileId] = true
      else if (file.extension === 'json' && fileId === this.currentRunnerFileId) {
        this.runnerNeedValidation = true
      }
    })

    let namespaceEntriesToRemove = []

    // delete removed files
    for (const fileId of removed) {
      delete this.files[fileId]
      delete this.fileNeedPreprocess[fileId]
      delete this.moduleNeedCompile[fileId]
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

    //logger?.debug('System::push_file_delta', `Namespaces invalidated: ${namespaceEntriesToRemove}`)

    // if there was any change, signal a rebuild is needed
    if (Object.keys(delta).length > 0 || removed.length > 0) {
      this.isBuilt = false
      this.isValidated = false
    }
  }

  pushIoDelta = (delta: Record<string, types.IOChannel>, rebuild: string[], removed: string[], logger?: Logger) => {
    // update the dictionary of availible io channels
    this.availChannels = { ...this.availChannels, ...delta }
    for (const key of Object.keys(delta)) this.ioNeedBuild[key] = true

    for (const removedKey of removed) {
      let io = this.activeChannels[removedKey]
      if (io) {
        io.destroy()
        delete this.activeChannels[removedKey]
      }
      delete this.availChannels[removedKey]
      delete this.ioNeedBuild[removedKey]
      for (const channelName of Object.keys(this.runner?.bus ?? {})) {
        if (this.channelLock[channelName] === removedKey) {
          delete this.channelLock[channelName]
        }
      }
      logger?.debug('System::push_io_delta', `IO destroyed. key = ${removedKey}`)
    }

    for (const rebuildKey of rebuild) {
      let io = this.activeChannels[rebuildKey]
      if (io) {
        io.destroy()
        delete this.activeChannels[rebuildKey]
      }
      this.ioNeedBuild[rebuildKey] = true
    }

    if (Object.keys(delta).length > 0 || removed.length > 0 || rebuild.length > 0) {
      this.isBuilt = false
    }
  }


  /**
   * 
   * @param frameState 
   * @param logger 
   * @returns 
   */
  dispatch = (frameState: types.SystemFrameState, logger?: Logger): boolean => {

    const queue = GPU.device.queue

    const { dt, frameNum, runDuration } = frameState
    let buf = [[runDuration], [dt], [frameNum]]
    this.frameStateBuffer.write(buf, queue)

    if (!this.isValidated || !this.isBuilt) {
      logger?.trace('System::dispatch', 'Forced to rebuild during dispatch.')
      return false
    }

    for (const activeChannel of Object.values(this.activeChannels)) {
      activeChannel.onBeginDispatch(queue)
    }
    const commandEncoder = GPU.device.createCommandEncoder()
    for (const pipeline of this.pipelines) {
      pipeline.dispatch(commandEncoder, logger)
    }
    for (const activeChannel of Object.values(this.activeChannels)) {
      activeChannel.onEndDispatch(queue)
    }

    queue.submit([commandEncoder.finish()])

    return true
  }
}

const frameStateNamespace: types.Namespace = {
  exported: {
    name: 'Frame State',
    definingFileId: 'system',
    dependentFileIds: [],
    indexedTypes: [
      {
        "name": null,
        "inner": {
          "Scalar": {
            "kind": "Float",
            "width": 4
          }
        }
      },
      {
        "name": null,
        "inner": {
          "Scalar": {
            "kind": "Sint",
            "width": 4
          }
        }
      },
      {
        "name": "Frame",
        "inner": {
          "Struct": {
            "members": [
              {
                "name": "time",
                "ty": 1,
                "binding": null,
                "offset": 0
              },
              {
                "name": "dt",
                "ty": 1,
                "binding": null,
                "offset": 4
              },
              {
                "name": "index",
                "ty": 2,
                "binding": null,
                "offset": 8
              }
            ],
            "span": 12
          }
        }
      }
    ],
    namedTypes: {
      'Frame': 3
    }
  },
  imported: []
}

export default System

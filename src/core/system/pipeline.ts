import { Logger } from '@core/recoil/atoms/console';
import * as types from '@core/types';
import Compiler from './compiler';
import TextureResource, { CanvasTextureResource } from './resource/textureResource';

export class QuadPipeline implements types.Pipeline {

  label!: string
  type!: types.PipelineType

  bindGroupLayout!: GPUBindGroupLayout
  bindGroups!: GPUBindGroup[];

  private pipeline!: GPURenderPipeline
  renderPassDescriptor!: GPURenderPassDescriptor

  targetTextures: TextureResource[] = []

  /**
   * TODO: demote pipeline build resposibilities
   * unfortunately, for now the build process must be done in a certain order and this appears to be
   * the busiest intersection of all the system components.
   * @param device 
   * @param run run data from JSON
   * @param modules module cache
   * @param moduleNeedCompile module cache validity
   * @param files project files
   * @param processedFiles processed shader files
   * @param resolve resolves resources from x::y paths in json
   * @param logger 
   * @returns true if successful false if not
   */
  build = async (
    device: GPUDevice,
    run: any,
    modules: Record<string, GPUShaderModule>,
    moduleNeedCompile: Record<string, boolean>,
    files: Record<string, types.File>,
    processedFiles: Record<string, types.ValidationResult>,
    resolve: (path?: string, logger?: Logger) => types.ResourceInstance | undefined,
    logger?: Logger
  ): Promise<boolean> => {

    const { binds, module, targets } = run
    const [filename, entryName] = module.split('::')



    const fileId = Object.values(files).find(f => f.filename === filename)?.id
    if (!fileId) {
      logger?.err(`System::build_modules[${filename}]`, 'File not found: ' + filename)
      return false
    }

    const processedFile = processedFiles[fileId]
    if (!processedFile) {
      logger?.err(`System::build_modules[${filename}]`, 'Internal error, file never processed: ' + filename)
      return false
    }

    if ('errors' in processedFile) {
      logger?.fatal(`System::build_modules[${filename}]`, 'Cannot continue compilation. Required shader did not pass validation: ' + filename)
      return false
    }


    // must exist if there are no errors
    const { nagaModule, processedShader } = processedFile
    const { types, entry_points, global_variables } = nagaModule!

    let entryPoint
    if (entryName) {
      entryPoint = entry_points.find(p => p.name === entryName)
      if (!entryPoint) {
        logger?.err(`System::build_modules[${filename}]`, 'Entry point not found: ' + entryName)
        return false
      }
      if (entryPoint.stage !== 'Fragment') {
        logger?.err(`System::build_modules[${filename}]`, 'Quad pass entry point must be Fragment stage.')
        return false
      }
    } else {
      entryPoint = entry_points.find(p => p.stage === 'Fragment')
      if (!entryPoint) {
        logger?.err(`System::build_modules[${filename}]`, 'Fragment entry point required for Quad pass pipeline.')
        return false
      }
    }


    // construct how this shader bindings will be slotted
    let bindSlots: string[][] = [[], [], [], []]
    let remaining: types.NagaGlobalVariable[] = []
    for (const globalVariable of global_variables) {

      if (!globalVariable.name) {
        logger?.err(`System::build_modules[${filename}]`, 'Global variable does not have name.')
        continue
      }
      const bindPath: string = binds[globalVariable.name]

      if (!bindPath) {
        logger?.err(`System::build_modules[${filename}]`, 'Bind not found in runner: ' + globalVariable.name)
        continue
      }
      const resource = resolve(bindPath, logger)
      if (!resource) {
        logger?.err(`Pipeline::build[${filename}]`, 'Resource at path not found: ' + bindPath)
        return false
      }

      const { binding, group } = globalVariable.binding
      if (binding === 999 || group === 999) {
        remaining.push(globalVariable)
        continue
      }
      if (!!bindSlots[group][binding]) {
        logger?.err(`System::build_modules[${filename}]`, 'Duplicate bindings for shader: ' + filename)
        return false
      }
      bindSlots[group][binding] = globalVariable.name!
    }

    outer: for (const globalVariable of remaining) {
      for (let i = 0; i < 4; i++) {
        if (bindSlots[i].length > 0) continue
        bindSlots[i] = [globalVariable.name!]
        continue outer
      }
      // dont worry about it... for now
      // TODO: find scheme to optimally determine shader bindings
      bindSlots[3].concat(globalVariable.name!)
    }


    // replace all placeholder groups and bindings in shader source code
    // with ones just generated from step before
    let bindedShader = processedShader
    bindSlots.forEach((bind, group) => bind.forEach((entry, binding) => {
      let re = new RegExp('@group\\(999\\) @binding\\(999\\)(?=\\s+var\\s*(<[a-z]+>\\s+' + entry + '))', 'g')
      bindedShader = bindedShader?.replace(re, `@group(${group}) @binding(${binding})`)
    }))


    // build bind group layout by resolving dependencies 
    // of resources built in earlier stages
    let bindGroupLayouts: GPUBindGroupLayout[] = []
    let bindGroups: GPUBindGroup[] = []
    for (const [group_idx, group] of bindSlots.entries()) {

      if (group.length == 0) continue
      let resources = group.map(name => resolve(binds[name], logger))
      if (!resources.every(r => !!r)) {
        logger?.fatal(`System::build_modules[${filename}]`, 'Unknown resource in binds')
        return false
      }
      let bindGroupLayoutEntries = resources.map((r, binding_idx) => r!.getBindGroupLayoutEntry(
        binding_idx, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE
      ))
      let bindGroupEntries = resources.map((r, binding_index) => r!.getBindGroupEntry(binding_index))


      device.pushErrorScope('validation')
      let bindGroupLayout = device.createBindGroupLayout({
        label: `${filename}[${group_idx}]`,
        entries: bindGroupLayoutEntries
      })
      let err1 = await device.popErrorScope()
      if (err1) {
        logger?.fatal(`System::build_modules[${filename}]`, 'Error when contructing bind group layout: ' + err.message)
        return false
      }
      bindGroupLayouts.push(bindGroupLayout)


      device.pushErrorScope('validation')
      let bindGroup = device.createBindGroup({
        label: `${filename}[${group_idx}]`,
        layout: bindGroupLayout,
        entries: bindGroupEntries
      })
      let err2 = await device.popErrorScope()
      if (err2) {
        logger?.fatal(`System::build_modules[${filename}]`, 'Error when contructing bind group: ' + err.message)
        return false
      }
      bindGroups.push(bindGroup)

    }


    // compiile module and test for validity
    let compiledModule: GPUShaderModule | null | undefined = modules[fileId]
    if (!compiledModule || moduleNeedCompile[fileId] === true) {
      logger?.trace('System::build_modules', 'Starting compilation for file ' + filename)
      compiledModule = await Compiler.instance().compile(
        device,
        files[fileId],
        bindedShader!
      )
    }
    if (!compiledModule) {
      logger?.fatal(`Pipeline::build[${filename}]`, 'Project failed compilation for above reasons')
      return false
    }

    // MUTATING INPUT STATE HERE
    modules[fileId] = compiledModule
    moduleNeedCompile[fileId] = false

    let targetFormats = []
    let targetTextures: TextureResource[] = []
    for (const targetPath of targets) {
      let res = resolve(targetPath, logger)
      if (!res) {
        logger?.fatal(`Pipeline::build[${filename}]`, 'Invalid fragment target path: ' + targetPath)
        return false
      }
      let tex = res as TextureResource
      targetFormats.push({
        format: tex.format
      })
      targetTextures.push(tex)
    }
    this.targetTextures = targetTextures


    // create pipeline
    let layout = device.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts
    })

    device.pushErrorScope('validation')
    const pipeline = await device.createRenderPipelineAsync({
      label: `${filename}[]`,
      layout: layout,
      vertex: {
        entryPoint: 'main',
        module: QuadPipeline.getVertexShaderModule(device)
      },
      fragment: {
        entryPoint: entryPoint.name,
        module: compiledModule,
        targets: targetFormats
      }
    })
    const err = await device.popErrorScope()
    if (err) {
      logger?.fatal(`System::build_modules[${filename}]`, 'Error when contructing pipeline: ' + err.message)
      return false
    }

    this.pipeline = pipeline
    this.renderPassDescriptor = {
      colorAttachments: targetTextures.map((v: TextureResource) => ({
        loadOp: 'clear',
        storeOp: 'store',
        view: v.texture.createView()
      }))
    }
    this.bindGroups = bindGroups

    return true
  }

  dispatch = (commandEncoder: GPUCommandEncoder, logger?: Logger): boolean => {

    for (const [idx, texture] of this.targetTextures.entries()) {
      if (texture instanceof CanvasTextureResource) {
        this.renderPassDescriptor.colorAttachments[idx].view =
          texture.canvasContext.getCurrentTexture().createView()
      }
    }
    const renderPass = commandEncoder.beginRenderPass(this.renderPassDescriptor)
    renderPass.setPipeline(this.pipeline)
    for (const [i, bindGroup] of this.bindGroups.entries()) {
      if (bindGroup) {
        renderPass.setBindGroup(i, bindGroup)
      }
    }
    renderPass.draw(6)
    renderPass.end()
    return true
  }


  static getNamespace = (): types.Namespace => {
    return {
      exported: {
        name: 'Quad Pipeline',
        definingFileId: 'system',
        dependentFileIds: [],
        indexedTypes: [
          {
            "name": null,
            "inner": {
              "Vector": {
                "size": "Quad",
                "kind": "Float",
                "width": 4
              }
            }
          },
          {
            "name": null,
            "inner": {
              "Vector": {
                "size": "Bi",
                "kind": "Float",
                "width": 4
              }
            }
          },
          {
            "name": "FragIn",
            "inner": {
              "Struct": {
                "members": [
                  {
                    "name": "position",
                    "ty": 1,
                    "binding": {
                      "BuiltIn": "Position"
                    },
                    "offset": 0
                  },
                  {
                    "name": "uv",
                    "ty": 2,
                    "binding": {
                      "Location": {
                        "location": 0,
                        "interpolation": "Perspective",
                        "sampling": "Center"
                      }
                    },
                    "offset": 16
                  }
                ],
                "span": 32
              }
            }
          }
        ],
        namedTypes: {
          'FragIn': 3
        }
      },
      imported: []
    }
  }

  static getVertexShaderModule = (device: GPUDevice): GPUShaderModule => {
    return device.createShaderModule({
      code: `
        struct FragIn {
          @builtin(position) position: vec4<f32>;
          @location(0) uv: vec2<f32>;
        };

        @stage(vertex)
        fn main(@builtin(vertex_index) v_index: u32) -> FragIn {
          var pos = array<vec2<f32>, 6>(
            vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
            vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
          );

          var output: FragIn;
          output.position = vec4<f32>(pos[v_index], 0.0, 1.0);
          output.uv = pos[v_index] * 0.5 + 0.5;
          return output;
        }
      `
    })
  }
}
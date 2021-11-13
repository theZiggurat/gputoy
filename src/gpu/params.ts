export type ParamType = 'int' | 'float' | 'color'

/**
 * Holds data and metadata for single parameter in uniform
 */
export interface ParamDesc {
  paramName: string,
  paramType: ParamType
  param: string
}

class Params {

  private params: ParamDesc[] = []
  private frozen: boolean

  constructor(frozen: boolean = false) {
    this.frozen = frozen
  }

  /**
   * Sets the parameters for this instance
   * @inparams params list of param descriptors
   * @returns whether the project these parameters belong to should recompile
   */
  set = (inparams: ParamDesc[]): boolean => {

    let needRecompile = inparams.length != this.params.length
    if (!needRecompile) {
      // determines if param name and type are the same. 
      // if they are, there is no need to recompile
      needRecompile = !inparams.every(newp => {
        let match = this.params.find(oldp => newp.paramName === oldp.paramName)
        return match ?  newp.paramType === match.paramType : false
      })
    }
    this.params = inparams
    return needRecompile
  }

  /**
   * Generates descriptors and allocates uniform buffer storage for current params
   * @param buffer buffer that will be allocated to proper size for uniform block
   * @param group bind group of uniform block (default 0)
   * @param binding bind index of uniform block (default 0)
   * @returns shader header that will declare the uniform block
   */
  generateDesc = (device: GPUDevice, group: number = 0, binding: number = 0): [string, GPUBuffer, GPUBindGroupLayout, GPUBindGroup] => {
    let fUniforms = this.params.filter(desc => desc.paramType == "float")
    let iUniforms = this.params.filter(desc => desc.paramType == "int")
    let cUniforms = this.params.filter(desc => desc.paramType == "color")
    let unidecl = []

    //console.log("generating descriptor")

    // float uniforms
    if(this.params.length > 0) {
      unidecl.push("[[block]] struct Params {")
      cUniforms.forEach(desc => unidecl.push(`\t${desc.paramName}: vec3<f32>;`))
      fUniforms.forEach(desc => unidecl.push(`\t${desc.paramName}: f32;`))
      iUniforms.forEach(desc => unidecl.push(`\t${desc.paramName}: i32;`))
      unidecl.push("};")
      unidecl.push(`[[group(${group}), binding(${binding})]]`)
      unidecl.push("var<uniform> p: Params;\n")
    }

    let size = Math.max(0, (cUniforms.length - 1) * 4 + 3) * 4
    size += (fUniforms.length + iUniforms.length) *  4

    //console.log("buffer len", size)

    let decl = unidecl.join("\n")
    let buffer = device.createBuffer({
      size: size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    let bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: binding,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: 'uniform'
        }
      }]
    })

    let bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{
        binding: binding,
        resource: { buffer: buffer }
      }]
    })
    return [decl, buffer, bindGroupLayout, bindGroup]
  }

  toBuffer = (device: GPUDevice, buffer: GPUBuffer) => {
    if (!device) return

    let fVals = this.params.filter(desc => desc.paramType == "float").map(desc => parseFloat(desc.param))
    let iVals = this.params.filter(desc => desc.paramType == "int").map(desc => parseInt(desc.param))
    let cVals = this.params.filter(desc => desc.paramType == "color").map(desc => {
      let z = parseInt(desc.param.substr(1), 16)
      return [(z >> 16 & 0xFF)/255, (z >> 8 & 0xFF)/255, (z >> 0 & 0xFF)/255]
    })

    //console.log("mapping to buffer")
    //console.log("fVals", fVals)
    //console.log("iVals", iVals)
    //console.log("cVals", cVals)

    let pointer32 = 0
    let floats: number[] = []
    cVals.forEach((color, idx) => {
      if (idx != cVals.length-1) {
        floats.push(color[0], color[1], color[2], 0)
        pointer32 += 4
      }
      else {
        floats.push(color[0], color[1], color[2])
        pointer32 += 3
      }
    })

    

    floats = floats.concat(fVals)
    pointer32 += fVals.length
    //console.log("float len", floats.length)
    //console.log("int len", iVals.length)
    //console.log("pointer pos", pointer32)
    //console.log("floats", floats)

    let byteBuffer = new ArrayBuffer((pointer32 + iVals.length) * 4)
    let floatBuffer = new Float32Array(byteBuffer, 0, pointer32)
    let intBuffer = new Int32Array(byteBuffer, pointer32 * 4, iVals.length)

    floatBuffer.set(floats)
    intBuffer.set(iVals)

    //console.log("buffer byte len", byteBuffer.byteLength)

    device.queue.writeBuffer(
      buffer,
      0,
      byteBuffer,
      0,
      byteBuffer.byteLength
    )
  }

  isEmpty = (): boolean => {
    return this.params.length == 0
  }
}

export default Params
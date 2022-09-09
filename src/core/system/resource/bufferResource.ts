import { Logger } from "@core/recoil/atoms/console";
import * as types from "@core/types";

export default class BufferResource implements types.ResourceInstance {
  label: string;
  buffer: GPUBuffer;
  layout: types.NagaTypeStructFull;
  optimizedMemLayout: types.NagaStructMemoryLayout;
  bufferBindingType: GPUBufferBindingType;
  bufferUsageFlags: GPUBufferUsageFlags;

  constructor(
    label: string,
    buffer: GPUBuffer,
    bufferBindingType: GPUBufferBindingType,
    bufferUsageFlags: GPUBufferUsageFlags,
    layout: types.NagaTypeStructFull,
    optimizedMemLayout: types.NagaStructMemoryLayout
  ) {
    this.label = label;
    this.buffer = buffer;
    this.bufferBindingType = bufferBindingType;
    this.bufferUsageFlags = bufferUsageFlags;
    this.layout = layout;
    this.optimizedMemLayout = optimizedMemLayout;
  }

  destroy = (logger?: Logger) => {
    logger?.debug(`Resource::Buffer[${this.label}]`, `Destroying`);
    this.buffer.destroy();
  };

  public static build = async (
    label: string,
    bufferInit: types.BufferArgs,
    layout: types.NagaTypeStructFull,
    device: GPUDevice,
    logger?: Logger
  ): Promise<types.ResourceInstance | undefined> => {
    const { initialValue, size, usageFlags, bindingType, modelName, length } =
      bufferInit;
    const { span } = layout;
    const optimizedMemLayout = types.getMemoryLayout(layout);

    const shouldMap = !!initialValue;

    device.pushErrorScope("validation");
    let buffer = device.createBuffer({
      label,
      size: span,
      usage: usageFlags,
      mappedAtCreation: shouldMap,
    });

    let bufferCreationError = await device.popErrorScope();
    if (bufferCreationError) {
      logger?.err(
        `Resource::Buffer[${label}]`,
        `Could not create buffer [${
          label ?? "unknown"
        }]. Reason: ${bufferCreationError}`
      );
      return undefined;
    }

    let ret = new BufferResource(
      label,
      buffer,
      bindingType,
      usageFlags,
      layout,
      optimizedMemLayout
    );
    if (shouldMap) {
      device.pushErrorScope("validation");
      const byteBuf = buffer.getMappedRange();
      ret._writeByteBuf(initialValue, byteBuf);
      buffer.unmap();
      let bufferMapError = await device.popErrorScope();
      if (bufferMapError) {
        logger?.err(
          `Resource::Buffer[${label}]`,
          `Could not create buffer [${
            label ?? "unknown"
          }]. Reason: ${bufferMapError}`
        );
        return undefined;
      }
    }

    return ret;
  };

  getBindGroupEntry = (binding: number): GPUBindGroupEntry => {
    return {
      binding,
      resource: {
        buffer: this.buffer,
      },
    };
  };

  getBindGroupLayoutEntry = (
    binding: number,
    visibility: number
  ): GPUBindGroupLayoutEntry => {
    return {
      binding,
      visibility,
      buffer: {
        type: this.bufferBindingType,
      },
    };
  };

  write = async (buf: ArrayLike<number[]>, queue: GPUQueue) => {
    const { span } = this.layout;
    const byteBuf = new ArrayBuffer(span);
    this._writeByteBuf(buf, byteBuf);
    queue.writeBuffer(this.buffer, 0, byteBuf, 0, span);
  };

  _writeByteBuf = (
    buf: ArrayLike<number[]>,
    byteBuffer: ArrayBuffer,
    logger?: Logger
  ) => {
    const { span } = this.layout;
    const { byteOffsets, scalarTypes } = this.optimizedMemLayout;
    const entryLen = byteOffsets.length;
    let floatView = new Float32Array(byteBuffer, 0, span / 4);
    let intView = new Int32Array(byteBuffer, 0, span / 4);
    let uintView = new Uint32Array(byteBuffer, 0, span / 4);
    let byteView = new Uint8Array(byteBuffer, 0, span);

    for (let i = 0; i < buf.length; i++) {
      const entryIndex = i % entryLen;
      switch (scalarTypes[entryIndex]) {
        case 0:
          intView.set(buf[i], byteOffsets[entryIndex] / 4);
          break;
        case 1:
          uintView.set(buf[i], byteOffsets[entryIndex] / 4);
          break;
        case 2:
          floatView.set(buf[i], byteOffsets[entryIndex] / 4);
          break;
        case 3: {
          if (this.bufferUsageFlags & GPUBufferUsage.UNIFORM) {
            logger?.err(
              `Resource::Buffer[${this.label}]`,
              "Uniform buffer must be host-sharable type (int, uint, float) and their composites (array, matrix, struct, vector)."
            );
            continue;
          }
          byteView.set(buf[i], byteOffsets[entryIndex]);
        }
      }
    }
  };
}

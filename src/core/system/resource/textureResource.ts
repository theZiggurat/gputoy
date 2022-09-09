import { Logger } from "@core/recoil/atoms/console";
import * as types from "@core/types";

type TextureInit = {
  label?: string;
  file?: types.File;
  width?: number;
  height?: number;
  format?: GPUTextureFormat;
  usage?: GPUTextureUsageFlags;
};
export default class TextureResource implements types.ResourceInstance {
  label: string;
  sampleType: GPUTextureSampleType = "float";
  format: GPUTextureFormat;
  texture: GPUTexture;

  width: number;
  height: number;

  constructor(
    label: string,
    texture: GPUTexture,
    width: number,
    height: number,
    format: GPUTextureFormat
  ) {
    this.label = label;
    this.texture = texture;
    this.width = width;
    this.height = height;
    this.format = format;
  }

  public static build = async (
    label: string,
    args: types.TextureArgs,
    device: GPUDevice,
    file?: types.File,
    logger?: Logger
  ): Promise<TextureResource | undefined> => {
    const { width, height, format, usage } = args;
    let textureDescriptor = {
      size: { width, height },
      format,
      usage,
    } as GPUTextureDescriptor;
    let bitmap = null;

    if (file && types.isBuffer(file.extension) && file.data) {
      let url = new URL(file.data);
      if (file.metadata["isFetched"] && url.protocol === "blob:") {
        let res = await fetch(file.data);
        let blob = await res.blob();
        bitmap = await createImageBitmap(blob);

        textureDescriptor = {
          size: {
            width: bitmap.width,
            height: bitmap.height,
          },
          format: format ?? "rgba32float",
          usage: GPUTextureUsage.COPY_DST,
        };
      } else {
        return undefined;
      }
    } else if (!width || !height || !format || !usage) {
      return undefined;
    }

    let returnLabel = file?.filename ?? label ?? "unknown";

    device.pushErrorScope("validation");
    let texture = device.createTexture({ ...textureDescriptor, label });
    let textureCreationError = await device.popErrorScope();
    if (textureCreationError) {
      logger?.err(
        `Resource::Texture[${returnLabel}]`,
        `Could not create texture due to the following error: ${textureCreationError}`
      );
      return undefined;
    }

    if (bitmap) {
      device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [
        bitmap.width,
        bitmap.height,
      ]);
    }

    let ret = new TextureResource(
      returnLabel,
      texture,
      width ?? bitmap!.width,
      height ?? bitmap!.height,
      textureDescriptor.format
    );
    return ret;
  };

  getBindGroupEntry = (binding: number): GPUBindGroupEntry => {
    return {
      binding,
      resource: this.texture.createView(),
    };
  };

  getBindGroupLayoutEntry = (
    binding: number,
    visibility: number
  ): GPUBindGroupLayoutEntry => {
    return {
      binding,
      visibility,
      texture: {
        sampleType: this.sampleType,
      },
    };
  };

  destroy(logger?: Logger) {
    logger?.debug(`Resource::Texture[${this.label}]`, `Destroying`);
    this.texture?.destroy();
  }
}

export class CanvasTextureResource extends TextureResource {
  canvasContext: GPUCanvasContext;
  canvasId: string;

  public static fromId = async (
    canvasId: string,
    device: GPUDevice,
    adapter: GPUAdapter,
    logger?: Logger
  ): Promise<TextureResource | undefined> => {
    const label = `canvas@id=${canvasId}`;

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      logger?.err(
        `Resource::Texture[${label}]`,
        `Canvas does not exist: id=${canvasId}`
      );
      return undefined;
    }

    const canvasContext = canvas.getContext("webgpu")!;
    if (!canvasContext) {
      logger?.err(
        `Resource::Texture[${label}]`,
        `Failed to create webgpu context on canvas: id=${canvasId}`
      );
      return undefined;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
      canvas.clientHeight * devicePixelRatio,
      canvas.clientWidth * devicePixelRatio,
    ];

    const preferredFormat = canvasContext.getPreferredFormat(adapter);

    canvasContext.configure({
      device,
      format: preferredFormat,
      size: presentationSize,
    });

    const texture = canvasContext.getCurrentTexture();

    logger?.debug(
      `Resource::Texture[${label}]`,
      `Texture attached on canvas: id=${canvasId}`
    );
    return new CanvasTextureResource(
      canvasContext,
      canvasId,
      label,
      texture,
      presentationSize[0],
      presentationSize[1],
      preferredFormat
    );
  };

  constructor(
    canvasContext: GPUCanvasContext,
    canvasId: string,
    label: string,
    texture: GPUTexture,
    width: number,
    height: number,
    format: GPUTextureFormat
  ) {
    super(label, texture, width, height, format);
    this.canvasId = canvasId;
    this.canvasContext = canvasContext;
  }

  destroy(logger?: Logger) {
    super.destroy(logger);
    logger?.debug(
      `Resource::Texture[${this.label}]`,
      `Unconfiguring canvas context`
    );
    this.canvasContext.unconfigure();
  }

  getBindGroupEntry = (binding: number): GPUBindGroupEntry => {
    return {
      binding,
      resource: this.canvasContext.getCurrentTexture().createView(),
    };
  };

  getCanvasId = () => this.canvasId;
}

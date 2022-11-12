import * as types from "@core/types";
import { Logger } from "@core/recoil/atoms/console";

export default class SamplerResource implements types.ResourceInstance {
  label: string;
  sampler: GPUSampler;
  desc?: GPUSamplerDescriptor;

  constructor(label: string, sampler: GPUSampler, desc?: GPUSamplerDescriptor) {
    this.label = label;
    this.sampler = sampler;
    this.desc = desc;
  }

  public static build = async (
    label: string,
    args: types.SamplerArgs,
    device: GPUDevice,
    logger?: Logger
  ): Promise<SamplerResource | undefined> => {
    device.pushErrorScope("validation");
    let sampler = device.createSampler({ ...args, label });
    let samplerCreationError = await device.popErrorScope();
    if (samplerCreationError) {
      logger?.err(
        `Resource::Texture[${label}]`,
        `Could not create texture due to the following error: ${samplerCreationError}`
      );
      return undefined;
    }

    let ret = new SamplerResource(label, sampler, args);
    return ret;
  };

  getBindGroupEntry = (binding: number): GPUBindGroupEntry => {
    return {
      binding,
      resource: this.sampler,
    };
  };

  getBindGroupLayoutEntry = (
    binding: number,
    visibility: number
  ): GPUBindGroupLayoutEntry => {
    return {
      binding,
      visibility,
      sampler: {
        type: "filtering",
      },
    };
  };

  // No desctruction needed for sampler
  destroy(_logger?: Logger) {}
}

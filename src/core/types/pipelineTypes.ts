import { Logger } from "@core/recoil/atoms/console";
import * as types from ".";

export type PipelineType = "compute" | "render" | "quad";

export interface Pipeline {
  /**
   * This will be used as webgpu internal label, along with console messages
   */
  label: string;

  type: PipelineType;

  bindGroupLayout: GPUBindGroupLayout;

  bindGroups: GPUBindGroup[];

  /**
   * TODO: demote pipeline build resposibilities
   * this is a really trash way to do it, i'll iron it out with some better contructs.
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
  build: (
    device: GPUDevice,
    run: any,
    modules: Record<string, GPUShaderModule>,
    moduleNeedCompile: Record<string, boolean>,
    files: Record<string, types.File>,
    processedFiles: Record<string, types.ValidationResult>,
    resolve: (
      path?: string,
      logger?: Logger
    ) => types.ResourceInstance | undefined,
    logger?: Logger
  ) => Promise<boolean>;

  dispatch: (commandEncoder: GPUCommandEncoder, logger?: Logger) => boolean;
}

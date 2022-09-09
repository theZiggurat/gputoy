import * as types from "@core/types";
import { Logger } from "@core/recoil/atoms/console";
class _GPU {
  adapter!: GPUAdapter;
  device!: GPUDevice;

  async init(logger?: Logger): Promise<types.GPUInitResult> {
    if (!navigator.gpu) return "incompatible";

    this.device = null as unknown as GPUDevice;

    await this.tryEnsureDeviceOnCurrentAdapter(logger);
    if (!this.adapter) return "error";

    while (!this.device) {
      this.adapter = null as unknown as GPUAdapter;
      await this.tryEnsureDeviceOnCurrentAdapter(logger);
      if (!this.adapter) return "error";
    }

    logger?.trace("GPU", "Device found");
    return "ok";
  }

  async tryEnsureDeviceOnCurrentAdapter(logger?: Logger) {
    if (!this.adapter) {
      this.adapter = (await navigator.gpu.requestAdapter({
        powerPreference: "high-performance",
      })) as GPUAdapter;

      if (!this.adapter) {
        logger?.err("GPU", "Adapter not found");
        return;
      }
    }

    logger?.trace("GPU", `Adapter found: ${this.adapter.name}`);
    this.device = await this.adapter.requestDevice();

    // this.device.lost.then((info) => {
    //     alert(`GPU Device lost. Info: ${info}`)
    //     //this.init()
    // })
  }

  isInitialized(): boolean {
    return !(this.adapter == null || this.device == null);
  }
}

const GPU = new _GPU();
export default GPU;

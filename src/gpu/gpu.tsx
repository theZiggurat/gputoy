
import Status from "./status"

export type GPUInitResult = 'ok' | 'error' | 'incompatible'

class _GPU {

    canvas: HTMLCanvasElement | null = null
    adapter: GPUAdapter | null = null
    device: GPUDevice | null = null
    canvasContext!: GPUCanvasContext

    constuctor() {}

    async init(): Promise<GPUInitResult> {

        if (!navigator.gpu)
            return 'incompatible'

        this.device = null

        await this.tryEnsureDeviceOnCurrentAdapter()
        if (!this.adapter) return 'error'

        while (!this.device) {
            this.adapter = null;
            await this.tryEnsureDeviceOnCurrentAdapter();
            if (!this.adapter) return 'error'
        }

        console.log(`GPUTrace -- Device found: ${this.device}`)
        return 'ok'
    }

    async tryEnsureDeviceOnCurrentAdapter() {
        if (!this.adapter) {
            this.adapter = await navigator.gpu.requestAdapter()

            if (!this.adapter) {
                console.error("GPUError -- Adapter not found")
                return;
            }
        }

        console.log(`GPUTrace -- Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        this.device.lost.then((info) => {
            alert(`GPU Device lost. Info: ${info}`)
            this.init()
        })
    }

    isInitialized(): boolean {
        return !(this.adapter == null && this.device == null)
    }

    attachCanvas(canvasID : string): string {
        if (this.isInitialized())
            return 'Cannot attach canvas: GPU failed or did not to initialize'

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement
        if (!this.canvas)
            return "Cannot attach canvas: Canvas doesn't exist"

        this.canvasContext = this.canvas.getContext('webgpu')
        if (!this.canvasContext)
            return 'Cannot attach canvas: Failed to create WEBGPU context'
        return 'Ok'
    }



    

}

const GPU = new _GPU;
export default GPU;
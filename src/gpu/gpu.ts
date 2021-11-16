
import Console from "./console"
import Status from "./status"

export type GPUInitResult = 'ok' | 'error' | 'incompatible'

class _GPU {

    private canvas!: HTMLCanvasElement
    adapter!: GPUAdapter
    device!: GPUDevice

    canvasContext!: GPUCanvasContext
    targetTexture!: GPUTexture
    presentationSize: number[] = [0, 0]

    preferredFormat!: GPUTextureFormat

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

        Console.trace('GPU', 'Device found')
        return 'ok'
    }

    async tryEnsureDeviceOnCurrentAdapter() {
        if (!this.adapter) {
            this.adapter = await navigator.gpu.requestAdapter()

            if (!this.adapter) {
                Console.err('GPU', 'Adapter not found')
                return;
            }
        }

        Console.trace('GPU', `Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        this.device.lost.then((info) => {
            alert(`GPU Device lost. Info: ${info}`)
            this.init()
        })
    }

    isInitialized(): boolean {
        return !(this.adapter == null || this.device == null)
    }

    attachCanvas(canvasID : string): string {

        if (!this.isInitialized()) 
            (async () => await this.init())()
        

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement
        if (!this.canvas)
            return "Cannot attach canvas: Canvas doesn't exist"

        this.canvasContext = this.canvas.getContext('webgpu')!
        if (!this.canvasContext)
            return 'Cannot attach canvas: Failed to create WEBGPU context'

        const rect = this.canvas.parentElement!.getBoundingClientRect()
        this.canvas.width = rect.width
        this.canvas.height = rect.height

        const devicePixelRatio = window.devicePixelRatio || 1
        this.presentationSize = [
            this.canvas.clientHeight * devicePixelRatio,
            this.canvas.clientWidth * devicePixelRatio
        ]

        this.preferredFormat = this.canvasContext.getPreferredFormat(this.adapter)

        this.canvasContext.configure({
            device: this.device,
            format: this.preferredFormat,
            size: this.presentationSize
        })

        this.targetTexture = this.canvasContext.getCurrentTexture()
        
        return 'Ok'
    }

    resizeRenderTarget() {

    }  

}

const GPU = new _GPU;
export default GPU;
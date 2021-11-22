import { Logger } from "../recoil/console"

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

    async init(logger: Logger): Promise<GPUInitResult> {

        if (!navigator.gpu)
            return 'incompatible'

        this.device = null

        await this.tryEnsureDeviceOnCurrentAdapter(logger)
        if (!this.adapter) return 'error'

        while (!this.device) {
            this.adapter = null;
            await this.tryEnsureDeviceOnCurrentAdapter(logger);
            if (!this.adapter) return 'error'
        }

        logger.trace('GPU', 'Device found')
        return 'ok'
    }

    async tryEnsureDeviceOnCurrentAdapter(logger: Logger) {
        if (!this.adapter) {
            this.adapter = await navigator.gpu.requestAdapter()

            if (!this.adapter) {
                logger.err('GPU', 'Adapter not found')
                return;
            }
        }

        logger.trace('GPU', `Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        this.device.lost.then((info) => {
            alert(`GPU Device lost. Info: ${info}`)
            //this.init()
        })
    }

    isInitialized(): boolean {
        return !(this.adapter == null || this.device == null)
    }

    attachCanvas(canvasID : string, logger: Logger): string {

        if (!this.isInitialized()) 
            (async () => await this.init(logger))()
        

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
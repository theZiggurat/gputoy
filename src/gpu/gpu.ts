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

        logger.debug('GPU', 'Device found')
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

        logger.debug('GPU', `Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        this.device.lost.then((info) => {
            alert(`GPU Device lost. Info: ${info}`)
            //this.init()
        })
    }

    isInitialized(): boolean {
        return !(this.adapter == null || this.device == null)
    }

    attachCanvas = async (canvasID : string, logger: Logger): Promise<boolean> => {

        if (!GPU.isInitialized()) 
            logger.debug('GPU', 'Trying to attach canvas without GPU initialized. Initializing now')  

        // if gpu is not initialized
        // keep trying unless browser is incompatible
        while (!GPU.isInitialized()) {
            let status = await GPU.init(logger)
            if (status === 'incompatible') {
                logger.debug('GPU', 'Browser Incompatable. Try https://caniuse.com/webgpu to find browsers compatible with WebGPU')
                return false
            }
            if (status === 'error') {
                logger.debug('GPU', 'Failed to initialize, retrying...')
            }
        }

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement
        if (!this.canvas) {
            //logger.err('GPU', "Cannot attach canvas: Canvas doesn't exist")
            return false
        }
            
        this.canvasContext = this.canvas.getContext('webgpu')!
        if (!this.canvasContext) {
            logger.fatal('GPU', 'Cannot attach canvas: Failed to create WEBGPU context')
            return false
        }

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

        logger.debug('GPU', `Attached canvas id=${canvasID}`)
        return true
    }

}

const GPU = new _GPU;
export default GPU;
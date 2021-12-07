import { Logger } from "../recoil/console"

export type GPUInitResult = 'ok' | 'error' | 'incompatible'

export type AttachResult = {
    canvas: HTMLCanvasElement,
    canvasContext: GPUCanvasContext,
    targetTexture: GPUTexture,
    presentationSize: number[],
    preferredFormat: GPUTextureFormat,
}

class _GPU {

    //canvas!: HTMLCanvasElement
    adapter!: GPUAdapter
    device!: GPUDevice

    initCalled: boolean = false

    // canvasContext!: GPUCanvasContext
    // targetTexture!: GPUTexture
    // presentationSize: number[] = [0, 0]

    // preferredFormat!: GPUTextureFormat

    constuctor() {}

    async init(logger?: Logger): Promise<GPUInitResult> {

        console.log('device init')

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

        logger?.debug('GPU', 'Device found')
        return 'ok'
    }

    async tryEnsureDeviceOnCurrentAdapter(logger?: Logger) {
        if (!this.adapter) {
            this.adapter = await navigator.gpu.requestAdapter()

            if (!this.adapter) {
                logger?.err('GPU', 'Adapter not found')
                return;
            }
        }

        logger?.debug('GPU', `Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        // this.device.lost.then((info) => {
        //     alert(`GPU Device lost. Info: ${info}`)
        //     //this.init()
        // })
    }

    isInitialized(): boolean {
        return !(this.adapter == null || this.device == null)
    }

    attachCanvas = async (canvasID : string, logger?: Logger): Promise<AttachResult | null> => {


        //console.log('attaching', canvasID)
        if (!GPU.isInitialized()) 
            logger?.debug('GPU', 'Trying to attach canvas without GPU initialized. Initializing now')  

        // if gpu is not initialized
        // keep trying unless browser is incompatible
        // but don't race with other calls to attachCanvas
        while (!GPU.isInitialized()) {
            if (!this.initCalled) {
                this.initCalled = true
                let status = await GPU.init(logger)
                if (status === 'incompatible') {
                    logger?.fatal('GPU', 'Browser Incompatable. Try https://caniuse.com/webgpu to find browsers compatible with WebGPU')
                    return null
                }
                if (status === 'error') {
                    logger?.debug('GPU', 'Failed to initialize, retrying...')
                    this.initCalled = false
                }
            } else {
                await sleep(50)
            }
        }

        const canvas = document.getElementById(canvasID) as HTMLCanvasElement
        if (!canvas) {
            //logger.err('GPU', "Cannot attach canvas: Canvas doesn't exist")
            return null
        }
            
        const canvasContext = canvas.getContext('webgpu')!
        if (!canvasContext) {
            logger?.fatal('GPU', 'Cannot attach canvas: Failed to create WEBGPU context')
            return null
        }

        const devicePixelRatio = window.devicePixelRatio || 1
        const presentationSize = [
            canvas.clientHeight * devicePixelRatio,
            canvas.clientWidth * devicePixelRatio
        ]

        const preferredFormat = canvasContext.getPreferredFormat(this.adapter)

        canvasContext.configure({
            device: this.device,
            format: preferredFormat,
            size: presentationSize
        })

        const targetTexture = canvasContext.getCurrentTexture()

        logger?.debug('GPU', `Attached canvas id=${canvasID}`)
        
        return {
            canvas,
            canvasContext,
            targetTexture,
            presentationSize,
            preferredFormat
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const GPU = new _GPU;
export default GPU;
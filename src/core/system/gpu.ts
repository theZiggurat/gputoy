import * as types from '@core/types'
import { Logger } from '@core/recoil/atoms/console'
class _GPU {

    adapter!: GPUAdapter
    device!: GPUDevice

    initCalled: boolean = false

    constuctor() { }

    async init(logger?: Logger): Promise<types.GPUInitResult> {

        console.log(navigator.gpu)
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

        logger?.trace('GPU', 'Device found')
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

        logger?.trace('GPU', `Adapter found: ${this.adapter.name}`)
        this.device = await this.adapter.requestDevice()

        // this.device.lost.then((info) => {
        //     alert(`GPU Device lost. Info: ${info}`)
        //     //this.init()
        // })
    }

    isInitialized(): boolean {
        return !(this.adapter == null || this.device == null)
    }

    attachCanvas = async (canvasID: string, logger?: Logger): Promise<types.AttachResult | null> => {

        if (!GPU.isInitialized()) {
            logger?.err('GPU', 'Trying to attach canvas without GPU initialized.')
            return null
        }

        // if gpu is not initialized
        // keep trying unless browser is incompatible
        // but don't race with other calls to attachCanvas
        // while (!GPU.isInitialized()) {
        //     if (!this.initCalled) {
        //         this.initCalled = true
        //         let status = await GPU.init(logger)
        //         if (status === 'incompatible') {
        //             logger?.fatal('GPU', 'Browser Incompatable. Try https://caniuse.com/webgpu to find browsers compatible with WebGPU')
        //             return null
        //         }
        //         if (status === 'error') {
        //             logger?.debug('GPU', 'Failed to initialize, retrying...')
        //             this.initCalled = false
        //         }
        //     } else {
        //         await sleep(50)
        //     }
        // }

        const canvas = document.getElementById(canvasID) as HTMLCanvasElement
        if (!canvas) {
            logger?.err('GPU', "Cannot attach canvas: Canvas doesn't exist")
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

    handleResize = (attachResult: types.AttachResult, newsize: number[]) => {
        attachResult.targetTexture.destroy()
        attachResult.canvasContext.configure({
            device: this.device,
            format: attachResult.canvasContext.getPreferredFormat(this.adapter),
            size: newsize,
        })
        attachResult.targetTexture = attachResult.canvasContext.getCurrentTexture()
        attachResult.presentationSize = newsize

        return attachResult
    }
}

const GPU = new _GPU;
export default GPU;
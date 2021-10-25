
export type GPUInitResult = 'ok' | 'error' | 'incompatible'

class _GPU {

    canvas!: HTMLCanvasElement
    adapter!: GPUAdapter
    device!: GPUDevice
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
        return !(!this.adapter || !this.device)
    }

    

}

const GPU = new _GPU;
export default GPU;
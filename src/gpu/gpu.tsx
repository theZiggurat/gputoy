class _GPU {

    canvas!: HTMLCanvasElement
    adapter!: GPUAdapter
    device!: GPUDevice
    canvasContext!: GPUCanvasContext

    constuctor() {}

    async init(): Promise<boolean> {
        this.device = null

        await tryEnsureDeviceOnCurrentAdapter()
        if (!this.adapter) return false

        while (!this.device) {
            this.adapter = null;
            await this.tryEnsureDeviceOnCurrentAdapter();
            if (!this.adapter) return false
        }
        return true
    }

    async tryEnsureDeviceOnCurrentAdapter() {
        if (!this.adapter) {
            this.adapter = await navigator.gpu.requestAdapter()

            if (!this.adapter) return;
        }

        this.device = await this.adapter.requestDevice()

        this.device.lost.then((info) => {
            alert(`GPU Device lost. Info: ${info}`)
            this.init()
        })
    }

    

}

const GPU = new _GPU;
export default GPU;
import vs from '../shaders/test_vs.wgsl'
import fs from '../shaders/test_fs.wgsl'

const particleParams = {
    trailPower: 16.0,
    speed: 10.0,
    sensorAngle: 0.174,
    turnSpeed: 0.104,
    numParticles: 100000
};
const decayRate = 0.98;
const diffuseAmount = 0.464;
const renderParams = {
    color1: [0.37, 0.38, 0.135],
    color2: [0.51, 0.59, 0.71],
    colorPow: 0.83,
    cutoff: 0.25,
};

class _WGPUContext {

    

    canvas: HTMLCanvasElement | null = null;
    adapter: GPUAdapter | null = null;
    device: GPUDevice | null = null;
    queue: GPUQueue | null = null;
    context: GPUCanvasContext | null = null;
    depthTexture: GPUTexture | null = null;
    depthTextureView: GPUTextureView | null = null;
    colorTexture: GPUTexture | null = null;
    colorTextureView: GPUTextureView | null = null;

    constructor() {
        
    }

    async registerCanvas(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;
        this.adapter = await navigator.gpu.requestAdapter();
        this.device = await this.adapter!.requestDevice();
        this.queue = this.device.queue;
        this.context = this.canvas.getContext('webgpu');

        let rect = this.canvas.parentElement?.getBoundingClientRect();
        console.log(rect);
        this.canvas.width = rect!.width;
        this.canvas.height = rect!.height;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationSize = [
            this.canvas.clientWidth,
            this.canvas.clientHeight,
        ];

        console.log(presentationSize);

        const canvasConfig: GPUCanvasConfiguration = {
            device: this.device,
            format: this.context!.getPreferredFormat(this.adapter!),
            size: presentationSize
            //usage: GPUTextureUsage. | GPUTextureUsage.COPY_SRC
        };

        this.context!.configure(canvasConfig);

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.clientWidth, this.canvas.clientHeight, 1],
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();

        this.colorTexture = this.context!.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        const positions = new Float32Array([
            1.0, -1.0, 0.0,
           -1.0, -1.0, 0.0,
            0.0,  1.0, 0.0
        ]);
        
        const colors = new Float32Array([
            1.0, 0.0, 0.0, // 🔴
            0.0, 1.0, 0.0, // 🟢
            0.0, 0.0, 1.0  // 🔵
        ]);
        
        const indices = new Uint16Array([ 0, 1, 2 ]);
        
        const createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {
            let desc = { size: ((arr.byteLength + 3) & ~3), usage, mappedAtCreation: true };
            let buffer = this.device!.createBuffer(desc);
        
            const writeArray =
                arr instanceof Uint16Array ? new Uint16Array(buffer.getMappedRange()) : new Float32Array(buffer.getMappedRange());
            writeArray.set(arr);
            buffer.unmap();
            return buffer;
        };
        
        let positionBuffer = createBuffer(positions, GPUBufferUsage.VERTEX);
        let colorBuffer = createBuffer(colors, GPUBufferUsage.VERTEX);
        let indexBuffer = createBuffer(indices, GPUBufferUsage.INDEX);


        const vsmDesc = { code: vs };
        let vertModule: GPUShaderModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = { code: fs };
        let fragModule: GPUShaderModule = this.device.createShaderModule(fsmDesc);

        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x3'
        };

        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
            offset: 0,
            format: 'float32x3'
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };

        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        const pipelineLayoutDesc = { bindGroupLayouts: [] };
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // 🎭 Shader Stages
        const vertex: GPUVertexState = {
            module: vertModule,
            entryPoint: 'main',
            buffers: [positionBufferDesc, colorBufferDesc]
        };

        // 🌀 Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: fragModule,
            entryPoint: 'main',
            targets: [colorState],
        };

        // 🟨 Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: 'cw',
            cullMode: 'none', topology: 'triangle-list'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,
            vertex,
            fragment,
            primitive,
            depthStencil,
        };

        let pipeline = this.device.createRenderPipeline(pipelineDesc);

        // ✋ Declare command handles
        let commandEncoder: GPUCommandEncoder = null;
        let passEncoder: GPURenderPassEncoder = null;

// ✍️ Write commands to send to the GPU
        const encodeCommands = () => {
            let colorAttachment: GPURenderPassColorAttachment = {
                view: this.colorTextureView!,
                loadValue: { r: 0, g: 0, b: 0, a: 1 },
                storeOp: 'store'
            };

            const depthAttachment: GPURenderPassDepthStencilAttachment = {
                view: this.depthTextureView!,
                depthLoadValue: 1,
                depthStoreOp: 'store',
                stencilLoadValue: 'load',
                stencilStoreOp: 'store'
            };

            const renderPassDesc: GPURenderPassDescriptor = {
                colorAttachments: [colorAttachment],
                depthStencilAttachment: depthAttachment
            };

            commandEncoder = this.device!.createCommandEncoder();

            // 🖌️ Encode drawing commands
            passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
            passEncoder.setPipeline(pipeline);
            passEncoder.setViewport(0, 0, this.canvas!.clientWidth, this.canvas!.clientHeight, 0, 1);
            passEncoder.setScissorRect(0, 0, this.canvas!.clientWidth, this.canvas!.clientHeight);
            passEncoder.setVertexBuffer(0, positionBuffer);
            passEncoder.setVertexBuffer(1, colorBuffer);
            passEncoder.setIndexBuffer(indexBuffer, 'uint16');
            passEncoder.drawIndexed(3);
            passEncoder.endPass();

            this.queue!.submit([commandEncoder.finish()]);
        }

        const render = () => {

            if (this.canvas!.clientWidth !== presentationSize[0] ||
                this.canvas!.clientHeight !== presentationSize[1]) {
                
                // resize
                this.colorTexture?.destroy();
                presentationSize[0] = this.canvas!.clientWidth;
                presentationSize[1] = this.canvas!.clientHeight;

                this.context?.configure({
                    device: this.device!,
                    format: this.context!.getPreferredFormat(this.adapter!),
                    size: presentationSize
                });

                this.colorTexture = this.context!.getCurrentTexture();
                this.colorTextureView = this.colorTexture.createView();

                this.depthTexture = this.device!.createTexture({
                    size: [this.canvas!.clientWidth, this.canvas!.clientHeight, 1],
                    dimension: '2d',
                    format: 'depth24plus-stencil8',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
                });
                this.depthTextureView = this.depthTexture.createView()
            }

            this.colorTexture = this.context!.getCurrentTexture();
            this.colorTextureView = this.colorTexture.createView();
        
            encodeCommands();
        
            requestAnimationFrame(render);
        };

        render();


    }
}


let WGPUContext = new _WGPUContext();
export default WGPUContext;
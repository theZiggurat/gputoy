import vs from '../shaders/test_vs.wgsl'
import fs from '../shaders/test_fs.wgsl'

import decayShader from "../shaders/decay.wgsl"
import computeShader from '../shaders/compute.wgsl'
import diffuseShader from '../shaders/diffuse.wgsl'
import drawShader from '../shaders/draw.wgsl'

const particleParams = [
    16.0, // trailPower
    10.0, // speed
    0.174, // sensorAngle
    0.104, // turnSpeed
];
const decayRate = [0.98];
const diffuseAmount = [0.464];
const renderParams = [
    0.37, 0.38, 0.135, // color1
    0.51, 0.59, 0.71, // color2
    0.83, // colorPow
    0.25 // cutoff
];

const NUM_PARTICLES = 1000;

class _WGPUContext {

    

    canvas: HTMLCanvasElement | null = null;
    adapter: GPUAdapter | null = null;
    device: GPUDevice | null = null;
    queue: GPUQueue | null = null;
    context: GPUCanvasContext | null = null;
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

        const canvasConfig: GPUCanvasConfiguration = {
            device: this.device,
            format: this.context!.getPreferredFormat(this.adapter!),
            size: presentationSize
            //usage: GPUTextureUsage. | GPUTextureUsage.COPY_SRC
        };

        this.context!.configure(canvasConfig);

        const sampler = this.device.createSampler({
            addressModeU: "repeat",
            addressModeV: "repeat",
            addressModeW: "repeat",
            magFilter: "nearest",
            minFilter: "linear",
            mipmapFilter: "nearest"
        });

        const particleBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage"
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d",
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "r32float",
                        viewDimension: "2d",
                    }
                }
            ]
        });

        const decayBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "r32float",
                        viewDimension: "2d"
                    }
                }
            ]
        });

        const diffuseBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: {
                        sampleType: "float",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "r32float",
                        viewDimension: "2d"
                    }
                }
            ]
        });

        const renderBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float",
                        multisampled: false,
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {
                        type: "non-filtering"
                    }
                }
            ]
        });

        const particlePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [particleBindGroupLayout]
        });

        const decayPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [decayBindGroupLayout]
        });

        const diffusePipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [diffuseBindGroupLayout]
        });

        const renderPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [renderBindGroupLayout]
        });

        const particleComputePipeline = this.device.createComputePipeline({
            compute: {
                module: this.device.createShaderModule({
                    code: computeShader
                }),
                entryPoint: "main"
            }
        });

        const decayComputePipeline = this.device.createComputePipeline({
            compute: {
                module: this.device.createShaderModule({
                    code: decayShader
                }),
                entryPoint: "main"
            }
        });

        const diffuseComputePipeline = this.device.createComputePipeline({
            compute: {
                module: this.device.createShaderModule({
                    code: diffuseShader
                }),
                entryPoint: "main"
            }
        });

        const renderShaderModule = this.device.createShaderModule({code: drawShader});
        const renderPipeline = this.device.createRenderPipeline({
            vertex: {
                module: renderShaderModule,
                entryPoint: "vs_main",
                buffers: [
                    {
                        arrayStride: 2 * 4,
                        stepMode: "vertex",
                        attributes: [{
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2'
                        }],
                    }
                ]
            },
            fragment: {
                module: renderShaderModule,
                entryPoint: "fs_main",
                targets: [
                    {
                        format: this.context!.getPreferredFormat(this.adapter!),
                    }
                ]
            },
            primitive: {
                topology: "triangle-list"
            }
        });


        const vertexBufferData = new Float32Array([-1.0, -1.0, 1.0, -1.0, 1.0, 
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0]);
        const vertexBuffer = this.device.createBuffer({
            size: vertexBufferData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.queue!.writeBuffer(
            vertexBuffer,
            0,
            vertexBufferData.buffer,
            vertexBufferData.byteOffset,
            vertexBufferData.byteLength
        );
        vertexBuffer.unmap()

        let arr = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            arr[4*i] = Math.random();
            arr[4*i+1] = Math.random();
            arr[4*i+2] = Math.random() * 2.0 - 1.0;
            arr[4*i+3] = Math.random() * 2.0 - 1.0;
        }
        const particleBufferData = new Float32Array(arr);
        const particleBuffers = [0, 1].map(() => 
            this.device!.createBuffer({
                mappedAtCreation: true,
                size: particleBufferData.length * Float32Array.BYTES_PER_ELEMENT,
                usage: GPUBufferUsage.STORAGE | 
                GPUBufferUsage.COPY_DST | 
                GPUBufferUsage.COPY_SRC
            })  
        );
        this.queue!.writeBuffer(
            particleBuffers[0],
            0,
            particleBufferData.buffer,
            particleBufferData.byteOffset,
            particleBufferData.byteLength
        );
        particleBuffers[0].unmap();
        particleBuffers[1].unmap();

        const trailTextures = [0, 1].map(() =>
            this.device!.createTexture({
                size: {
                    width: presentationSize[0],
                    height: presentationSize[1]
                },
                format: 'r32float',
                usage: GPUTextureUsage.COPY_DST 
                | GPUTextureUsage.STORAGE_BINDING 
                | GPUTextureUsage.TEXTURE_BINDING,
            })
        );

        const particleUniformData = new Float32Array(particleParams);
        const particleUniformBuffer = this.device!.createBuffer({
            size: particleUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.queue!.writeBuffer(
            particleUniformBuffer,
            0,
            particleUniformData.buffer,
            particleUniformData.byteOffset,
            particleUniformData.byteLength
        );
        particleUniformBuffer.unmap();

        const decayUniformData = new Float32Array(decayRate);
        const decayUniformBuffer = this.device!.createBuffer({
            size: decayUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.queue!.writeBuffer(
            decayUniformBuffer,
            0,
            decayUniformData.buffer,
            decayUniformData.byteOffset,
            decayUniformData.byteLength
        );
        decayUniformBuffer.unmap();
        
        const diffuseUniformData = new Float32Array(diffuseAmount);
        const diffuseUniformBuffer = this.device!.createBuffer({
            size: diffuseUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.queue!.writeBuffer(
            diffuseUniformBuffer,
            0,
            diffuseUniformData.buffer,
            diffuseUniformData.byteOffset,
            diffuseUniformData.byteLength
        );
        diffuseUniformBuffer.unmap();

        const renderUniformData = new Float32Array(renderParams);
        const renderUniformBuffer = this.device!.createBuffer({
            size: renderUniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.queue!.writeBuffer(
            renderUniformBuffer,
            0,
            renderUniformData.buffer,
            renderUniformData.byteOffset,
            renderUniformData.byteLength
        );
        renderUniformBuffer.unmap();

        const particleBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: particleBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: particleUniformBuffer }
                    },
                    {
                        binding: 1,
                        resource:{ buffer: particleBuffers[i] }
                    },
                    {
                        binding: 2,
                        resource: { buffer: particleBuffers[1-i] }
                    },
                    {
                        binding: 3,
                        resource: trailTextures[i].createView()
                    },
                    {
                        binding: 4,
                        resource: trailTextures[1-i].createView()
                    }
                ]
            })
        );

        const decayBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: decayBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: decayUniformBuffer }
                    },
                    {
                        binding: 1,
                        resource: trailTextures[1-i].createView()
                    },
                    {
                        binding: 2,
                        resource: trailTextures[i].createView()
                    }
                ]
            })
        );

        const diffuseBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: diffuseBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: diffuseUniformBuffer }
                    },
                    {
                        binding: 1,
                        resource: trailTextures[i].createView()
                    },
                    {
                        binding: 2,
                        resource: trailTextures[1-i].createView()
                    }
                ]
            })
        );

        const renderBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: renderBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: renderUniformBuffer }
                    },
                    {
                        binding: 1,
                        resource: trailTextures[1-i].createView()
                    },
                    {
                        binding: 2,
                        resource: sampler
                    }
                ]
            })
        );

        const particleWorkGroupCount = Math.ceil(NUM_PARTICLES / 64);
        const screenWorkGroupCount = [presentationSize[0] / 16, presentationSize[1] / 16];


        this.colorTexture = this.context!.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();


        let frameNum = 0;

        const encodeCommands = () => {

            const renderPassDesc: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: this.colorTextureView!,
                    loadValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: 'store'
                }],
            };

            const commandEncoder = this.device!.createCommandEncoder();

            {
                const cpass = commandEncoder.beginComputePass();
                cpass.setPipeline(particleComputePipeline);
                cpass.setBindGroup(0, particleBindGroups[frameNum % 2]);
                cpass.dispatch(particleWorkGroupCount);
                cpass.endPass();
            }

            {
                const cpass = commandEncoder.beginComputePass();
                cpass.setPipeline(decayComputePipeline);
                cpass.setBindGroup(0, decayBindGroups[frameNum % 2]);
                cpass.dispatch(screenWorkGroupCount[0], screenWorkGroupCount[1]);
                cpass.endPass();
            }
            {
                const cpass = commandEncoder.beginComputePass();
                cpass.setPipeline(diffuseComputePipeline);
                cpass.setBindGroup(0, diffuseBindGroups[frameNum % 2]);
                cpass.dispatch(screenWorkGroupCount[0], screenWorkGroupCount[1]);
                cpass.endPass();
            }
            {
                const rpass = commandEncoder.beginRenderPass(renderPassDesc);
                rpass.setPipeline(renderPipeline);
                //rpass.setViewport(0, 0, this.canvas!.clientWidth, this.canvas!.clientHeight, 0, 1);
                //rpass.setScissorRect(0, 0, this.canvas!.clientWidth, this.canvas!.clientHeight);
                rpass.setVertexBuffer(0, vertexBuffer);
                rpass.setBindGroup(0, renderBindGroups[frameNum % 2]);
                rpass.draw(6, 1, 0, 0);
                rpass.endPass();
            }

           
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
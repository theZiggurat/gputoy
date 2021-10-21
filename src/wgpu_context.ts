import decayShader from "../shaders/decay.wgsl"
import computeShader from '../shaders/compute.wgsl'
import diffuseShader from '../shaders/diffuse.wgsl'
import drawShader from '../shaders/draw.wgsl'

import paramsList from './params.json';

const NUM_PARTICLES = 1000000;

class _WGPUContext {

    canvas: HTMLCanvasElement | null = null;
    adapter: GPUAdapter | null = null;
    device: GPUDevice | null = null;
    queue: GPUQueue | null = null;
    context: GPUCanvasContext | null = null;
    colorTexture: GPUTexture | null = null;
    colorTextureView: GPUTextureView | null = null;

    updateUniforms: ((index: number) => void) | null = null;

    constructor() {
        
    }

    async registerCanvas(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;
        this.adapter = await navigator.gpu.requestAdapter();
        this.device = await this.adapter!.requestDevice();
        this.queue = this.device.queue;
        this.context = this.canvas.getContext('webgpu');

        let rect = this.canvas.parentElement?.getBoundingClientRect();
        this.canvas.width = rect!.width;
        this.canvas.height = rect!.height;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationSize = [
            this.canvas.clientWidth * devicePixelRatio,
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
            minFilter: "nearest",
            mipmapFilter: "nearest"
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
                        sampleType: "unfilterable-float",
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
            layout: renderPipelineLayout,
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
        });
        this.queue!.writeBuffer(
            vertexBuffer,
            0,
            vertexBufferData.buffer,
            vertexBufferData.byteOffset,
            vertexBufferData.byteLength
        );

        let arr = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            let radius = Math.random() * 0.2;
            let angle = Math.random() * Math.PI * 2;
            arr[4*i] = Math.cos(angle) * radius + 0.5;
            arr[4*i+1] = Math.sin(angle) * radius + 0.5;
            arr[4*i+2] = (Math.random() * 2.0 - 1.0) * 0.05;
            arr[4*i+3] = (Math.random() * 2.0 - 1.0) * 0.05;
        }
        const particleBufferData = new Float32Array(arr);
        const particleBuffers = [0, 1].map(() => 
            this.device!.createBuffer({
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

        const particleResolutionData = new Uint32Array([presentationSize[0], presentationSize[1], NUM_PARTICLES]);
        const particleResolutionBuffer = this.device!.createBuffer({
            size: particleResolutionData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.queue!.writeBuffer(
            particleResolutionBuffer,
            0,
            particleResolutionData.buffer,
            particleResolutionData.byteOffset,
            particleResolutionData.byteLength
        );

        const particleUniformBuffer = this.device!.createBuffer({
            size: 5 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const decayUniformBuffer = this.device!.createBuffer({
            size: 1 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        const diffuseUniformBuffer = this.device!.createBuffer({
            size: 1 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const renderUniformBuffer = this.device!.createBuffer({
            size: 8 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const particleBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: particleComputePipeline.getBindGroupLayout(0),
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
                    },
                    {
                        binding: 5,
                        resource: { buffer: particleResolutionBuffer }
                    }
                ]
            })
        );

        const decayBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: decayComputePipeline.getBindGroupLayout(0),
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
                    },
                    {
                        binding: 3,
                        resource: { buffer: particleResolutionBuffer }
                    }
                ]
            })
        );

        const diffuseBindGroups = [0, 1].map((i) => 
            this.device!.createBindGroup({
                layout: diffuseComputePipeline.getBindGroupLayout(0),
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
                    },
                    {
                        binding: 3,
                        resource: { buffer: particleResolutionBuffer }
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
        const screenWorkGroupCount = 
            [Math.ceil(presentationSize[0] / 16), Math.ceil(presentationSize[1] / 16)];


        this.colorTexture = this.context!.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        let frameNum = 0;

        const encodeCommands = () => {

            const renderPassDesc: GPURenderPassDescriptor = {
                label: "render",
                colorAttachments: [{
                    view: this.colorTextureView!,
                    loadValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: 'store'
                }],
            };

            const commandEncoder = this.device!.createCommandEncoder();

            {
                const cpass = commandEncoder.beginComputePass({label: "particle"});
                cpass.setPipeline(particleComputePipeline);
                cpass.setBindGroup(0, particleBindGroups[frameNum % 2]);
                cpass.dispatch(particleWorkGroupCount);
                cpass.endPass();
            }

            {
                const cpass = commandEncoder.beginComputePass({label: "decay"});
                cpass.setPipeline(decayComputePipeline);
                cpass.setBindGroup(0, decayBindGroups[frameNum % 2]);
                cpass.dispatch(screenWorkGroupCount[0], screenWorkGroupCount[1]);
                cpass.endPass();
            }
            {
                const cpass = commandEncoder.beginComputePass({label: "diffuse"});
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

            ++frameNum;
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

        this.updateUniforms = function updateUniforms(index: number) {
            let param = paramsList.params[index];

            this.queue!.writeBuffer(
                particleUniformBuffer,
                0,
                new Float32Array([
                    param.particle.trail_power,
                    param.particle.speed,
                    param.particle.sensor_angle,
                    param.particle.sensor_distance,
                    param.particle.turn_speed
                ])
            );

            this.queue!.writeBuffer(
                decayUniformBuffer,
                0,
                new Float32Array([
                    param.decay.decay_rate
                ])
            );

            this.queue!.writeBuffer(
                diffuseUniformBuffer,
                0,
                new Float32Array([
                    param.diffuse.diffuse_amount
                ])
            );

            this.queue!.writeBuffer(
                renderUniformBuffer,
                0,
                new Float32Array([
                    param.render.color_1[0],
                    param.render.color_1[1],
                    param.render.color_1[2],
                    param.render.color_2[0],
                    param.render.color_2[1],
                    param.render.color_2[2],
                    param.render.color_pow,
                    param.render.cutoff
                ])
            );

            this.queue!.writeBuffer(
                particleResolutionBuffer,
                0,
                new Uint32Array([
                    presentationSize[0],
                    presentationSize[1],
                    param.particle.num_particles
                ])
            )
        }

        this.updateUniforms(4);

        render();


    }
}


let WGPUContext = new _WGPUContext();
export default WGPUContext;
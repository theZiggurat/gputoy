This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# GPUtoy

GPUtoy is the next evolution of shader prototyping. It is like shadertoy, but built with WebGPU. 

## Planned features:

  - Fully syntax highlighted shader editors
    - .wgsl
    - .glsl
  - Node editor for shader i/o
    - Modules that can be reordered, ping-ponged, conditionally run, etc.
  - Shader auto binding
    - Automatically imports bindings based on names given to uniforms and buffers in UI
  - 'Marketplace' for shader modules that can be plugged into a project
    - Import modules into project
    - User can export modules they created to the marketplace
  - Browser for community creations which can be viewed or forked
    - Canonical mode ( as the creator intended to be viewed/interacted with )
    - Forked mode ( user can edit the shaders and parameters to their liking )
    - User ratings
      - Like/Dislike
      - Performance ratings
    - User comments
  - Buffer generation scripts and i/o
    - buffer from image
    - buffer from sound
    - buffer from video
    - buffer from file (models, csv, blobs of data)
    - buffer from code generation (random values, api calls, etc)
  - Animation editor
    - allow shader parameters to change through time
  - Universal uniforms
    - time
    - mouse input
    - keyboard input
    - resolution
    - date
  - Thoughtful error messages
    - shader compilation errors
    - device errors
    - bind group mismatches
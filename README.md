This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# [GPUtoy](http://gputoy.io/)

GPUtoy is the next evolution of shader prototyping. It builds on the functionality of Shadertoy by exposing the new capabilties of WebGPU.

This project is early in development. The website is live on the link above, but it will require Chrome Canary with developer flags to run WebGPU. This will change in the near future as WebGPU stabilizes. Additionally, many features are still in development or not implemented.

## Features:

  - [ ] Fully syntax highlighted shader editors
    - [x] .wgsl
    - [ ] .glsl
  - [ ] Node editor for shader i/o
    - [ ] Modules that can be reordered, ping-ponged, conditionally run, etc.
  - [x] Shader auto binding
    - [x] Automatically imports bindings based on names given to uniforms and buffers in UI
  - [ ] 'Marketplace' for shader modules that can be plugged into a project
    - [ ] Import modules into project
    - [ ] User can export modules they created to the marketplace
  - [ ] Browser for community creations which can be viewed or forked
    - [ ] Canonical mode ( as the creator intended to be viewed/interacted with )
    - [ ] Forked mode ( user can edit the shaders and parameters to their liking )
    - [ ] User ratings
      - [ ] Like/Dislike
      - [ ] Performance ratings
    - [ ] User comments
  - [ ] Buffer generation scripts and i/o
    - [ ] buffer from image
    - [ ] buffer from sound
    - [ ] buffer from video
    - [ ] buffer from file (models, csv, blobs of data)
    - [ ] buffer from code generation (random values, api calls, etc)
  - [ ] Animation editor
    - [ ] animate parameters   
    - [ ] dope sheet w/ bezier curves
    - [ ] event system
  - [ ] Export
    - [ ] embed link
    - [ ] api link
    - [ ] npm module and minified js for importing shaders into your own project
  - [x] Thoughtful error messages
    - [x] shader compilation errors
    - [x] device errors

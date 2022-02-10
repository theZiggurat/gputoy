[![License](https://img.shields.io/github/license/theZiggurat/gputoy)]()
![GitHub package.json version](https://img.shields.io/github/package-json/v/theZiggurat/gputoy?color=blue)
![GitHub deployments](https://img.shields.io/github/deployments/theZiggurat/gputoy/preview?label=production&logo=vercel&logoColor=white)
![GitHub deployments](https://img.shields.io/github/deployments/theZiggurat/gputoy/preview?label=preview&logo=vercel&logoColor=white)

#### `Note: See supported browsers`
#### `Note++: This project is a major work in progress. Many ui functions are not implemented yet and some implemented features may be inconsistent or buggy. Check the `[docs](docs/)&nbsp;`if you're interesting in contributing.`
# [gputoy](https://gputoy.io)

## A shader prototyping tool built for [`WebGPU`](https://www.w3.org/TR/webgpu/).
![A screenshot of gputoy running in firefox](./docs/ui-demo.png)

## **Top Goals**


- **Multi Language Support**
  - `glsl` and `wgsl` shader compilation.
  - Target `wgsl` using [`Naga`](https://github.com/gfx-rs/naga) in a small `webassembly` module. This is to provide maximum browser support as `wgsl` is the preferred language for `webgpu`. Chrome's implementation is able to take `spirv`, but I believe this will be removed.
  - User should be able to use `glsl` and `wgsl` in the same project. gputoy's `webgpu` systems should treat the compiled modules identically.

- **Sharing Projects**
  - Sharing should be easy and should come in different varieties.
    - Publishing: Makes project visible to other users. 
    - Generated link: A link that the owner can generate for other users to view a project, even if it's unpublished.
    - Embed: Generates an embedable link.

- **Barrier of Entry**
  - Starting a new project and forking a project should be dead simple.
  - Unobtrusive tutorials to learn app features.
  - Documentation for both languages provided within editor. 


- **Good Editor UX/UI**
  - Provide an intuitive and consistent experience. 
  - Maintain high component reusability to ensure consistency across many site actions. 
  - Take inspiration from elegant user interfaces like Blender and Ableton.

- **Extendability**
  - User should be able to abstract shader functions, shader uniforms, sub-passes, buffer layouts, buffer initializations, and more.
  - These abstractions can be saved to use in a future project and published for other users to use, like a marketplace.
  - For example, an extension for ray march shapes. For the end user, it would provide a set of functions they can call in their shader to calculate signed distance for common shapes.

- **Low Bandwith/Storage**
  - I dont ever plan on running ads on gputoy, so expenses should be kept to a minimum. Monetization will only be used as necessary.
  - Database queries should only be used when needed.

***

## **Currently Supported Browsers**
  - Chrome version > 94 will work automatically thanks to origin trial
    - Chrome version > 80 with `enable-unsafe-webgpu` flag enabled
  - Firefox version > 63 with `dom.webgpu.enabled` flag enabled
  - Safari version > 11.1 with `WebGPU` experimental feature on MACOS (not tested)

## **Stack**

- Nextjs - Framework
- Vercel - Hosting
- React - UI
- Recoil - State management
- Prisma - ORM
- Chakra - Styling
- Monaco - VSCode-like editor
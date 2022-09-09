/* tslint:disable */
/* eslint-disable */
/**
* @param {string} src
* @param {string} lang
* @param {string} stage
* @returns {string}
*/
export function introspect(src: string, lang: string, stage: string): string;
/**
* @param {string} src
* @param {string} stage
* @returns {string | undefined}
*/
export function transpile_glsl_to_wgsl(src: string, stage: string): string | undefined;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly introspect: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly transpile_glsl_to_wgsl: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;

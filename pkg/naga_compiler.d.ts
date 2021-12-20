/* tslint:disable */
/* eslint-disable */
/**
* @param {string} src
* @param {string} stage
* @returns {string | undefined}
*/
export function compile_glsl(src: string, stage: string): string | undefined;
/**
* @returns {string}
*/
export function get_module_info(): string;
/**
* @returns {string}
*/
export function get_ir(): string;
/**
* @returns {string}
*/
export function get_errors(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly compile_glsl: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly get_module_info: (a: number) => void;
  readonly get_ir: (a: number) => void;
  readonly get_errors: (a: number) => void;
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

#[macro_use]
extern crate lazy_static;

use std::ops::Deref;
use wasm_bindgen::prelude::*;
use serde_json;

use naga::{Module, ShaderStage};
use naga::valid::{Validator, ValidationFlags, Capabilities};

use console_error_panic_hook;
use std::panic;
use std::sync::Mutex;

///
///
lazy_static! {
    static ref MODULE_INFO: Mutex<String> = Mutex::new(String::new());
    static ref IR: Mutex<String> = Mutex::new(String::new());
    static ref ERRORS: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn error(s: &str);
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

#[wasm_bindgen]
pub fn introspect(src: &str, lang: &str, stage: &str) -> Option<String> {

    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let module = match lang {
        "glsl" => introspect_glsl(src, stage),
        "wgsl" => introspect_wgsl(src),
        _ => None
    };

    module.map(|m| serde_json::to_string_pretty(&m).unwrap())
}

fn introspect_glsl(src: &str, stage: &str) -> Option<Module> {
    use naga::front::glsl::{Parser};

    let mut parser = Parser::default();
    let options = naga::front::glsl::Options::from(match stage {
        "vertex" => ShaderStage::Vertex,
        "fragment" => ShaderStage::Fragment,
        "compute" => ShaderStage::Compute,
        _ => {
            let errstr = format!("Invalid shader stage: {}", stage);
            error(&errstr[..]);
            ERRORS.lock().unwrap().push(errstr);
            return None;
        }
    });

    match parser.parse(&options, src) {
        Ok(module) => Some(module),
        Err(errs) => {
            errs.iter().for_each(|err| {
                error(&err.to_string()[..]);
                ERRORS.lock().unwrap().push(err.to_string());
            });
            None
        }
    }
}

fn introspect_wgsl(src: &str) -> Result<Module, String> {
    use naga::front::wgsl::Parser;

    let mut parser = Parser::new();
    match parser.parse(src) {
        Ok(module) => Ok(module),
        Err(err) => serde_json::to_string(&err).unwrap()
    }
}

#[wasm_bindgen]
pub fn compile_glsl(src: &str, stage: &str) -> Option<String> {
    use naga::front::glsl::{Parser};
    use naga::back::wgsl::*;

    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let mut parser = Parser::default();
    let options = naga::front::glsl::Options::from(match stage {
        "vertex" => ShaderStage::Vertex,
        "fragment" => ShaderStage::Fragment,
        "compute" => ShaderStage::Compute,
        _ => {
            let errstr = format!("Invalid shader stage: {}", stage);
            error(&errstr[..]);
            ERRORS.lock().unwrap().push(errstr);
            return None;
        }
    });

    let module = match parser.parse(&options, src) {
        Ok(module) => module,
        Err(errs) => {
            errs.iter().for_each(|err| {
                error(&err.to_string()[..]);
                ERRORS.lock().unwrap().push(err.to_string());
            });
            return None;
        }
    };

    let string = serde_json::to_string_pretty(&module).unwrap();
    IR.lock().unwrap().replace_range(.., &string[..]);

    let info = match Validator::new(
        ValidationFlags::all(), Capabilities::all()
    )
        .validate(&module) {
        Ok(info) => info,
        Err(err) => {
            error(&err.to_string()[..]);
            ERRORS.lock().unwrap().push(err.to_string());
            return None;
        }
    };

    let string = serde_json::to_string_pretty(&info).unwrap();
    MODULE_INFO.lock().unwrap().replace_range(.., &string[..]);

    let out = String::new();
    let mut wgsl = Writer::new(out, WriterFlags::all());
    match wgsl.write(&module, &info) {
        Ok(_) => (),
        Err(err) => {
            error(&err.to_string()[..]);
            ERRORS.lock().unwrap().push(err.to_string());
            return None;
        }
    }

    let out = wgsl.finish();

    Some(out)
}

// #[wasm_bindgen]
// pub fn compile_wgsl(src: &str) -> Option<Uint32Array> {
//     use naga::front::wgsl::Parser;
//
//     panic::set_hook(Box::new(console_error_panic_hook::hook));
//
//     let mut parser = Parser::new();
//
//     let module = match parser.parse(src) {
//         Ok(module) => module,
//         Err(err) => {
//             error(&err.emit_to_string(&src)[..]);
//             ERRORS.lock().unwrap().push(err.emit_to_string(&src));
//             return None;
//         }
//     };
//
//     let config = ron::ser::PrettyConfig::default().with_new_line("\n".to_string());
//     let string = ron::ser::to_string_pretty(&module, config).unwrap();
//     IR.lock().unwrap().replace_range(.., &string[..]);
//
//     let info = match Validator::new(
//         ValidationFlags::all(), Capabilities::all()
//     )
//         .validate(&module) {
//         Ok(info) => info,
//         Err(err) => {
//             error(&err.to_string()[..]);
//             ERRORS.lock().unwrap().push(err.to_string());
//             return None;
//         }
//     };
//
//     let config = ron::ser::PrettyConfig::default().with_new_line("\n".to_string());
//     let string = ron::ser::to_string_pretty(&info, config).unwrap();
//     MODULE_INFO.lock().unwrap().replace_range(.., &string[..]);
//
//     let mut spv = Writer::new(&Options::default()).unwrap();
//     let mut out = Vec::new();
//     match spv.write(&module, &info, None, &mut out) {
//         Ok(_) => (),
//         Err(err) => {
//             error(&err.to_string()[..]);
//             ERRORS.lock().unwrap().push(err.to_string());
//             return None;
//         }
//     }
//
//     Some(Uint32Array::from(&out[..]))
// }

#[wasm_bindgen]
pub fn get_module_info() -> String {
    String::clone(MODULE_INFO.lock().unwrap().deref())
}

#[wasm_bindgen]
pub fn get_ir() -> String {
    String::clone(IR.lock().unwrap().deref())
}

#[wasm_bindgen]
pub fn get_errors() -> String {
    let errors = ERRORS.lock().unwrap().drain(..).collect::<Vec<_>>();
    serde_json::to_string(&errors).unwrap()
}
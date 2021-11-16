use wasm_bindgen::prelude::*;
use js_sys::Uint32Array;

use console_error_panic_hook;
use std::panic;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn error(s: &str);
}

#[wasm_bindgen]
pub fn test() -> Uint32Array {
    use naga::ShaderStage;
    use naga::back::spv::{Writer, Options};
    use naga::front::glsl::{Parser};

    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let glsl = r#"
        #version 450 core

        void main(void) {}
    "#;

    let mut parser = Parser::default();
    let options = naga::front::glsl::Options::from(ShaderStage::Vertex);

    let module = parser.parse(&options, glsl)
        .map_err(|errs| errs.iter().map(|err| err.to_string()).collect::<String>())
        .unwrap();

    let info = naga::valid::Validator::new(
        naga::valid::ValidationFlags::all(), naga::valid::Capabilities::all()
    )
        .validate(&module)
        .unwrap();

    let mut spv = Writer::new(&Options::default()).unwrap();
    let mut out = Vec::new();
    let _ = spv.write(&module, &info, None, &mut out).unwrap();

    Uint32Array::from(&out[..])

}
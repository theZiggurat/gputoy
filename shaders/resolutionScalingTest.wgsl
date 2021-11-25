[[stage(fragment)]]
fn main(in: VertexOutput) -> [[location(0)]] vec4<f32> {

    let pixelPos = (vec2<f32>(i.res) * in.uv) / 64.;
    let frac = fract(pixelPos);
    return vec4<f32>(vec3<f32>(frac, 0.5), 1.0);

}
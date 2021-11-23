const vertex = `
struct VertexOutput {
  [[builtin(position)]] position: vec4<f32>;
  [[location(1)]] uv: vec2<f32>;
};

[[stage(vertex)]]
fn vs_main(
    [[location(0)]] position: vec2<f32>,
) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(position, 0.0, 1.0);
    out.uv = (position + vec2<f32>(1.0)) / 2.0;
    return out;
}
`

export default {
  vertex
}
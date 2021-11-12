[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {

    let col = 0.5 * cos(in.uv.xyx + f.time + vec3<f32>(0., 2., 4.)) + 0.5;
    return vec4<f32>(col, 1.0);

}

[[block]]
struct SimParams {
  decaySpeed: f32;
};

[[block]] 
struct Resolution {
  width: u32;
  height: u32;
  num_particles: u32;
};

[[group(0), binding(0)]] var<uniform> params : SimParams;
[[group(0), binding(1)]] var trailSrc : texture_2d<f32>;
[[group(0), binding(2)]] var trailDst : texture_storage_2d<r32float, write>;
[[group(0), binding(3)]] var<uniform> resolution: Resolution;


[[stage(compute), workgroup_size(16, 16, 1)]]
fn main([[builtin(global_invocation_id)]] global_invocation_id: vec3<u32>) {
    var coords : vec2<i32> = vec2<i32>(global_invocation_id.xy);

    if (coords.x > i32(resolution.width) || coords.y > i32(resolution.height)) {
        return;
    }

    var color: vec4<f32> = textureLoad(trailSrc, coords, 0);
    color.r = color.r * params.decaySpeed;


    textureStore(trailDst, coords, color);
}

[[block]]
struct SimParams {
    diffuseAmount: f32;
};

[[group(0), binding(0)]] var<uniform> params : SimParams;
[[group(0), binding(1)]] var trailSrc : texture_2d<f32>;
[[group(0), binding(2)]] var trailDst : texture_storage_2d<r32float, write>;

var<private> Pi: f32 = 6.28318530718;
var<private> res: vec2<i32> = vec2<i32>(3200, 1800);

[[stage(compute), workgroup_size(16, 16, 1)]]
fn main([[builtin(global_invocation_id)]] global_invocation_id: vec3<u32>) {
    var coords : vec2<i32> = vec2<i32>(global_invocation_id.xy);

    if (coords.x >= res.x || coords.y >= res.y) {
        return;
    }

    var avg: f32 = 0.0;
    for(var i : i32 = -2; i < 3; i = i + 1) {
        for(var j : i32 = -2; j < 3; j = j + 1) {
            var new_coord: vec2<i32> = coords + vec2<i32>(i, j);
            avg = avg + textureLoad(trailSrc, new_coord, 0).r;
        }
    }
    avg = avg / 25.0;

    var color: vec4<f32> = vec4<f32>(avg, 0.0, 0.0, 1.0);
    var og_color: vec4<f32> = textureLoad(trailSrc, coords, 0);
    color = mix(og_color, color, vec4<f32>(params.diffuseAmount, 0.0, 0.0, 0.0));
    textureStore(trailDst, coords, color);
}

[[block]]
struct SimParams {
    r1: f32;
    g1: f32;
    b1: f32;
    r2: f32;
    g2: f32;
    b2: f32;
    color_pow: f32;
    cutoff: f32;
};

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

fn mstep(a: f32, b: f32) -> f32 {
    if (a > b) {
        return 0.0;
    }   
    return 1.0;
}

fn rgb2hsv(c: vec3<f32>) -> vec3<f32>
{
    var K: vec4<f32> = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    var step1: f32 = mstep(c.z, c.y);
    var p: vec4<f32> = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), vec4<f32>(step1, step1, step1, step1));
    var step2: f32 = mstep(p.x, c.r);
    var q: vec4<f32> = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), vec4<f32>(step2, step2, step2, step2));

    var d: f32 = q.x - min(q.w, q.y);
    var e: f32 = 1.0e-10;
    return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

fn hsv2rgb(c: vec3<f32>) -> vec3<f32>
{
    var K: vec4<f32>  = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    var p: vec3<f32> = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0)), c.yyy);
}

[[group(0), binding(0)]] var<uniform> params : SimParams;
[[group(0), binding(1)]] var r_color: texture_2d<f32>;
[[group(0), binding(2)]] var r_sampler: sampler;

[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {

    var weight: f32 = textureSample(r_color, r_sampler, in.uv).r / 8.0;
    weight = pow(weight, params.color_pow);
    
    var color: vec3<f32>;
    if (weight > params.cutoff) {
        var acc_weight: f32 = (weight - params.cutoff) / (1.0 - params.cutoff);
        color = vec3<f32>(
            mix(params.r1, params.r2, acc_weight),
            mix(params.g1, params.g2, acc_weight),
            mix(params.b1, params.b2, acc_weight)
        );
    } else {
        var acc_weight: f32 = weight / params.cutoff;
        var hsv: vec3<f32> = rgb2hsv(vec3<f32>(params.r1, params.g1, params.b1));
        hsv.x = fract(hsv.x  - (1.0 - acc_weight) * 0.1);
        hsv.z = acc_weight;
        color = hsv2rgb(hsv);
    }

    return vec4<f32>(color, 1.0);

}

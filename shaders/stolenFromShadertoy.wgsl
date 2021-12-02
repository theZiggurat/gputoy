// shader by toto https://www.shadertoy.com/view/wlVGWd
// converted to wgsl

fn rand(n: vec2<f32>) -> f32 {
    return fract(sin(dot(n, vec2<f32>(12.9898, 4.1414))) * 43758.5453);
}

fn noise(p: vec2<f32>) -> f32 {
    let ip: vec2<f32> = floor(p);
    var u: vec2<f32> = fract(p);
    u = u*u*(3.0-(2.0*u));

    let res: f32 = mix(
        mix(rand(ip),rand(ip+vec2<f32>(1.0,0.0)),u.x),
        mix(rand(ip+vec2<f32>(0.0,1.0)),rand(ip+vec2<f32>(1.0,1.0)),u.x),u.y);
    return res*res;
}

fn fbm(qIn: vec2<f32>) -> f32{
    let m2: mat2x2<f32> = mat2x2<f32>(vec2<f32>(0.8,-0.6), vec2<f32>(0.6,0.8));
    var q: vec2<f32> = qIn;
    var f: f32 = 0.0;
    f = f + 0.5000*noise( q ); q = m2*q*2.02;
    f = f + 0.2500*noise( q ); q = m2*q*2.03;
    f = f + 0.1250*noise( q ); q = m2*q*2.01;
    f = f + 0.0625*noise( q );

    return f/0.769;
}

fn pattern(s: vec2<f32> ) -> f32 {
  let q: vec2<f32> = vec2<f32>(fbm(s + vec2<f32>(0.0,0.0)));
  var r: vec2<f32> = vec2<f32>(fbm(s + 4.0*q + vec2<f32>(1.7,9.2)));
  r = r + i.time * p.speed * 0.15;
  return fbm( s + 1.760*r );
}

[[stage(fragment)]]
fn main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    
    let scaled: vec2<f32> = in.uv * 4.5; // Scale UV to make it nicer in that big screen !
    let displacement: f32 = pattern(scaled);
    var color: vec4<f32> = vec4<f32>(displacement * 1.2, 0.2, displacement * 5., 1.);
    color = color * vec4<f32>(p.colorMod, 1.0);
    return color;

}
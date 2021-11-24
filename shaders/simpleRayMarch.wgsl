var<private> MAX_STEPS: i32 = 100;
var<private> MAX_DISTANCE: f32 = 100.;
var<private> SURF_DIST: f32 = 0.1;

fn getDist(p: vec3<f32>) -> f32 {
  let s = vec4<f32>(0., 1., 6., 1.);
  let sphereDist = length(p-s.xyz)-s.w;
  let planeDist = p.y;
  
  let d = min(planeDist, sphereDist);
  return d;
}


fn rayMarch(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
  var dO = 0.;
  for (var i: i32 = 0; i < MAX_STEPS; i = i + 1) {
    let p: vec3<f32> = ro + rd * dO;
    let dS = getDist(p);
    dO = dO + dS;
    if (dO > MAX_DISTANCE || dS < SURF_DIST) {
      break;
    }
  }
  return dO;
}

[[stage(fragment)]]
fn main(in: VertexOutput) -> [[location(0)]] vec4<f32> {

    let uvnorm = (in.uv * -2.0 + 1.0) * i.aspectRatio;
    var col = vec3<f32>(0.);
    
    let ro = vec3<f32>(0., 1., 0.);
    let rd = normalize(vec3<f32>(uvnorm.x, uvnorm.y, 1.));
    
    let d = rayMarch(ro, rd)/6.;
    col = vec3<f32>(d);
    
    return vec4<f32>(col, 1.0);

}

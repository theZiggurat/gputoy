var<private> PI: f32 = 3.14159265358979323846264338327950288;

struct Particle {
  pos : vec2<f32>;
  vel : vec2<f32>;
};

[[block]]
struct SimParams {
  trail_power: f32;
  speed: f32;
  sensor_angle: f32;
  sensor_distance: f32;
  turn_speed: f32;
  num_particles: u32;
};

[[block]]
struct Particles {
  particles : [[stride(16)]] array<Particle>;
};

[[group(0), binding(0)]] var<uniform> params : SimParams;
[[group(0), binding(1)]] var<storage, read> particlesSrc : Particles;
[[group(0), binding(2)]] var<storage, read_write> particlesDst : Particles;
[[group(0), binding(3)]] var trailSrc : texture_2d<f32>;
[[group(0), binding(4)]] var trailDst : texture_storage_2d<r32float, write>;


fn rotate(v: vec2<f32>, ang: f32) -> vec2<f32> {
  var s: f32 = sin(ang);
  var c: f32 = cos(ang);
  var m: mat2x2<f32> = mat2x2<f32>(vec2<f32>(c, s), vec2<f32>(-s, c));
  return m * v;
}

fn to_trail_space(v: vec2<f32>) -> vec2<i32> {
  var vec_norm: vec2<f32> = vec2<f32>((v.x) / 2., (v.y) / 2.);
  return vec2<i32>(i32(vec_norm.x * 3200.0), i32(vec_norm.y * 1800.0));
}


[[stage(compute), workgroup_size(64)]]
fn main([[builtin(global_invocation_id)]] global_invocation_id: vec3<u32>) {
  var index = global_invocation_id.x;
  if (index >= params.num_particles) {
    return;
  }

  var vPos : vec2<f32> = particlesSrc.particles[index].pos;
  var vVel : vec2<f32> = particlesSrc.particles[index].vel;

  vVel = normalize(vVel);

  var sens_left: vec2<f32> = rotate(vVel, params.sensor_angle) * params.sensor_distance + vPos;
  var sens_right: vec2<f32> = rotate(vVel, -params.sensor_angle) * params.sensor_distance + vPos;
  var sens_forward: vec2<f32> = vVel * params.sensor_distance + vPos;

  var sens_left_pixel: vec2<i32> = to_trail_space(sens_left);
  var sens_right_pixel: vec2<i32> = to_trail_space(sens_right);
  var sens_forward_pixel: vec2<i32> = to_trail_space(sens_forward);

  var val_left: f32 = textureLoad(trailSrc, sens_left_pixel, 0).r;
  var val_right: f32 = textureLoad(trailSrc, sens_right_pixel, 0).r;
  var val_forward: f32 = textureLoad(trailSrc, sens_forward_pixel, 0).r;

  var turn_factor: f32;
  if (val_forward > val_left && val_forward > val_right) {
    turn_factor = 0.0;
  } if (val_forward < val_left && val_forward > val_right) {
    turn_factor = 1.0 * params.turn_speed;
  } if (val_forward > val_left && val_forward < val_right) {
    turn_factor = -1.0 * params.turn_speed;
  } if (val_forward < val_left && val_forward < val_right) {
    turn_factor = sign(val_left - val_right) * params.turn_speed;
  }

  var vVel_new: vec2<f32> = normalize(rotate(vVel, turn_factor));

  var vPos_new: vec2<f32> = vPos + ((params.speed/10000.0) * vVel_new);

  if (vPos_new.x < 0.0) {
    vPos_new.x = 0.999;
  }
  if (vPos_new.x >= 1.0) {
    vPos_new.x = 0.0;
  }
  if (vPos_new.y < 0.0) {
    vPos_new.y = 0.999;
  }
  if (vPos_new.y >= 1.0) {
    vPos_new.y = 0.0;
  }

  particlesDst.particles[index].pos = vPos_new;
  particlesDst.particles[index].vel = vVel_new;

  var particle_pixel_index: vec2<i32> = to_trail_space(vPos_new);
  var trail: vec4<f32> = textureLoad(trailSrc, particle_pixel_index, 0);
  trail.r = min(trail.r + (1.0 / 144.0 * params.trail_power), 8.0);

  textureStore(trailDst, particle_pixel_index, trail);
}
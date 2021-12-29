
import React, { useEffect, useState } from 'react'
import shader from '../../../shaders/basicShader.wgsl'
import Editor from 'react-simple-code-editor'

//@ts-ignore
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-rust";

export const demoHighlight = (input) =>
  highlight(input, languages.rust)
    .split("\n")
    .map((line: string, i: number) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");


const demoCodeStart = `
[[stage(fragment)]]
fn main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
`

const demoCodeMid = `
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
`

const demoCodeEnd = `
}
`

const EditorDemo = () => {

  const [ptr, setPtr] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setPtr(ptr => ptr + 1), 5)
    return () => clearInterval(timer)
  }, [])

  return (
    <Editor
      className="editor"
      textareaId="codeArea"
      value={demoCodeStart.concat(demoCodeMid.substr(0, ptr)).concat(demoCodeEnd)}
      highlight={code => demoHighlight(code)}
      readOnly
      padding="1rem"
      style={{
        fontFamily: '"JetBrains Mono","Fira code", "Fira Mono", monospace',
        fontSize: 10,
      }}
    />
  )
}

export default EditorDemo
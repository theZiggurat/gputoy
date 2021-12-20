import "prismjs";
// @ts-ignore
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-glsl";
import "prismjs/components/prism-rust";
import { FileErrors } from "@recoil/project";

export default (input: string, lang: string, filename: string, fileErrors: FileErrors) =>
  highlight(input, lang == 'wgsl' ? languages.rust : languages.glsl)
    .split("\n")
    .map((line: string, i: number) => i == fileErrors[filename] - 1 ? `<span class="editorLineNumberTest">${line}</span>` : line)
    .map((line: string, i: number) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");
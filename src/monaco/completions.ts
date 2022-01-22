/* eslint-disable import/no-anonymous-default-export */
import type * as monaco from 'monaco-editor-core'
import { wgslFuncs } from './docs'

const completions: monaco.languages.CompletionItemProvider = {
  provideCompletionItems: (model, position) => {

    var word = model.getWordUntilPosition(position)
    var range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    }

    let newpos = position.with(undefined, word.startColumn - 1)
    let prevWord = model.getWordUntilPosition(newpos)
    let delim = model.getLineContent(position.lineNumber).charAt(word.startColumn - 2)

    let suggestions: Partial<monaco.languages.CompletionItem>[] = wgslFuncs.concat(keywordSnippets).concat(keywordSuggestions)
    if (delim == '.') {
      switch (prevWord.word) {
        case 'i': suggestions = includedSuggestions; break
      }
    }

    return {
      suggestions: suggestions.map(f => { return { kind: 1, ...f, range } })
    }
  }
}

const includedSuggestions = [
  {
    "detail": "f32",
    "documentation": "Running time in seconds",
    "label": "time",
    "insertText": "time",
    "kind": 9,
  },
  {
    "detail": "i32",
    "documentation": "Current frame number",
    "label": "frame",
    "insertText": "frame",
    "kind": 9,
  },
  {
    "detail": "f32",
    "documentation": "Frame delta time in seconds",
    "label": "dt",
    "insertText": "dt",
    "kind": 9,
  },
  {
    "detail": "vec2<f32>",
    "documentation": "Mouse position normalized to screen size (range [0,1] for x and y)",
    "label": "mouseNorm",
    "insertText": "mouseNorm",
    "kind": 9,
  },
  {
    "detail": "vec2<i32>",
    "documentation": "Resolution of viewport during current frame",
    "label": "res",
    "insertText": "res",
    "kind": 9,
  },
  {
    "detail": "vec2<i32>",
    "documentation": "Mouse position in pixels",
    "label": "mouse",
    "insertText": "mouse",
    "kind": 9,
  },
  {
    "detail": "f32",
    "documentation": "width/height of viewport. To make uv's account for aspect ratio, try uv * vec2<f32>(i.aspectRatio, 1.0)",
    "label": "aspectRatio",
    "insertText": "aspectRatio",
    "kind": 9,
  },
]

const keywordSnippets = [
  {
    "detail": "Snippet",
    "documentation": "If block",
    "label": "if",
    "insertText": 'if (${1}) {\n\t\n}',
    "insertTextRules": 4,
    "kind": 27,
  },
  {
    "detail": "Snippet",
    "documentation": "If block",
    "label": "ifelse",
    "insertText": 'if (${1}) {\n\t\n} else {\n\t\n}',
    "insertTextRules": 4,
    "kind": 27,
  },
]

const keywordSuggestions = [
  'bitcast', 'break', 'case', 'continue', 'continuing', 'default', 'discard', 'else', 'enable', 'fallthrough', 'fn',
  'for', 'if', 'let', 'loop', 'private', 'read', 'read_write', 'return', 'storage', 'struct', 'switch', 'type',
  'uniform', 'var', 'workgroup', 'write', 'stage', 'workgroup_size', 'group', 'binding', 'block'
].map(w => { return { "label": w, "insertText": w, "kind": 17 } })

export default completions
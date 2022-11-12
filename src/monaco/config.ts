import * as monaco from "monaco-editor-core";

export const languageID = "wgsl";

export const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint =
  {
    id: languageID,
  };

/* eslint-disable import/no-anonymous-default-export */

export default {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "attributes", foreground: "#CFBD10" },
    { token: "keyword", foreground: "#FF6188" },
    { token: "typeKeyword", foreground: "#AB9DF2" },
    { token: "constants", foreground: "#AB9DF2" },
    { token: "identifier", foreground: "#FFFFFF60" },
    { token: "function", foreground: "#A9DC76" },
    { token: "struct", foreground: "#AB9DF2" },
    { token: "number", foreground: "#78DCE8" },
    { token: "operator", foreground: "#FF6188" },
    { token: "punctuation", foreground: "#939293" },
    { token: "params", foreground: "#FFFF00" },
  ],
  colors: {
    "editor.foreground": "#FFFFFF30",
    "editor.background": "#050505",
    "editorCursor.foreground": "#FFFFFF80",
    "editor.lineHighlightBackground": "#FFFFFF10",
    "editorLineNumber.foreground": "#FFFFFF30",
    "editorLineNumber.activeForeground": "#FFFFFF80",
    "editor.selectionBackground": "#FFFFFF25",
    "editor.inactiveSelectionBackground": "#FFFFFF15",
    "scrollbarSlider.background": "#FFFFFF06", // Slider background color.
    "scrollbarSlider.hoverBackground": "#FFFFFF10", // Slider background color when hovering.
    "scrollbarSlider.activeBackground": "#FFFFFF16",
    "editorWidget.background": "#0D0D0D",
    "editorSuggestWidget.background": "#0B0B0B", // Background color of the suggest widget.
    "editorSuggestWidget.border": "#FFFFFF20", // Border color of the suggest widget.
    "editorSuggestWidget.foreground": "#FFFFFF80",
    "editorSuggestWidget.selectedBackground": "#FFFFFF20", // Background color of the selected entry in the suggest widget.
    "editorSuggestWidget.highlightForeground": "#78DCE8", // Color of the match highlights in the suggest widget.
    "editorWidget.border": "#FFFFFF20",
    "input.background": "#FFFFFF20", // Input box background.
    "input.foreground": "#FFFFFF80", // Input box foreground.
    "input.border": "none", // Input box border.
    "editorIndentGuide.background": "#FFFFFF20",
  },
};

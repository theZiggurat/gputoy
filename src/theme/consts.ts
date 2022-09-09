export default {
  fontMono: "monospace",
};

export const darkEditor = {
  ".token.comment": { color: "#727072", fontStyle: "italic" },
  ".token.constant": { color: "#AB9DF2" },
  ".token.hexcode": { color: "#AB9DF2" },
  ".token.number": { color: "#AB9DF2" },
  ".token.builtin": { color: "#AB9DF2" },
  ".token.char": { color: "#AB9DF2" },
  ".token.symbol": { color: "#FC9867" },
  ".token.function": { color: "#A9DC76" },
  ".token.inserted": { color: "#A9DC76" },
  ".token.namespace": { color: "#78DCE8" },
  ".token.class-name": { color: "#78DCE8" },
  ".token.tag": { color: "#FF6188" },
  ".token.keyword": { color: "#FF6188" },
  ".token.operator": { color: "#FF6188" },
  ".token.deleted": { color: "#FF6188" },
  ".token.attr-name": { color: "#78DCE8", fontStyle: "italic" },
  ".token.selector": { color: "#78DCE8", fontStyle: "italic" },
  ".token.changed": { color: "#FFD866" },
  ".token.string": { color: "#FFD866" },
  ".token.variable": { color: "#C1C0C0" },
  ".token.punctuation": { color: "#939293" },
  ".token.property": { color: "#FCFCFA" },
  ".token.important,\n.token.bold": { fontWeight: "bold" },
  ".token.italic": { fontStyle: "italic" },
};

export const lightEditor = {
  ".token.comment": { color: "#008000" },
  ".token.builtin": { color: "#0000FF" },
  ".token.function": { color: "#0000FF" },
  ".token.keyword": { color: "#0000FF" },
  ".token.number": { color: "#098658" },
  ".token.variable": { color: "#098658" },
  ".token.inserted": { color: "#098658" },
  ".token.operator": { color: "#000000" },
  ".token.constant": { color: "#811F3F" },
  ".token.hexcode": { color: "#811F3F" },
  ".token.regex": { color: "#811F3F" },
  ".token.tag": { color: "#800000" },
  ".token.attr-name": { color: "#FF0000" },
  ".token.selector": { color: "#FF0000" },
  ".token.property": { color: "#FF0000" },
  ".token.deleted": { color: "#A31515" },
  ".token.string": { color: "#A31515" },
  ".token.changed": { color: "#0451A5" },
  ".token.punctuation": { color: "#0451A5" },
  ".token.important,\n.token.bold": { fontWeight: "bold" },
  ".token.italic": { fontStyle: "italic" },
};

export const darkResizer = {
  ".Resizer": {
    background: "rgba(255, 255, 255, 0.1)",
    zIndex: 0,
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    boxSizing: "border-box",
    MozBackgroundClip: "padding",
    WebkitBackgroundClip: "padding",
    backgroundClip: "padding-box",
  },
  ".Resizer:hover": {
    WebkitTransition: "all 2s ease",
    transition: "all 2s ease",
  },
  ".Resizer.horizontal": {
    height: "11px",
    margin: "-5px 0",
    borderTop: "5px solid rgba(255, 255, 255, 0)",
    borderBottom: "5px solid rgba(255, 255, 255, 0)",
    cursor: "row-resize",
    width: "100%",
  },
  ".Resizer.horizontal:hover": {
    borderTop: "5px solid rgba(255, 255, 255, 0.2)",
    borderBottom: "5px solid rgba(255, 255, 255, 0.2)",
  },
  ".Resizer.vertical": {
    width: "11px",
    margin: "0 -5px",
    borderLeft: "5px solid rgba(255, 255, 255, 0)",
    borderRight: "5px solid rgba(255, 255, 255, 0)",
    cursor: "col-resize",
  },
  ".Resizer.vertical:hover": {
    borderLeft: "5px solid rgba(255, 255, 255, 0.2)",
    borderRight: "5px solid rgba(255, 255, 255, 0.2)",
  },
  ".Resizer.disabled": { cursor: "auto" },
  ".Resizer.disabled:hover": { borderColor: "transparent" },
};

export const lightResizer = {
  ".Resizer": {
    background: "rgba(0, 0, 0, 0.2)",
    zIndex: 0,
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    boxSizing: "border-box",
    MozBackgroundClip: "padding",
    WebkitBackgroundClip: "padding",
    backgroundClip: "padding-box",
  },
  ".Resizer:hover": {
    WebkitTransition: "all 2s ease",
    transition: "all 2s ease",
  },
  ".Resizer.horizontal": {
    height: "11px",
    margin: "-5px 0",
    borderTop: "5px solid rgba(0, 0, 0, 0)",
    borderBottom: "5px solid rgba(0, 0, 0, 0)",
    cursor: "row-resize",
    width: "100%",
  },
  ".Resizer.horizontal:hover": {
    borderTop: "5px solid rgba(0, 0, 0, 0.5)",
    borderBottom: "5px solid rgba(0, 0, 0, 0.5)",
  },
  ".Resizer.vertical": {
    width: "11px",
    margin: "0 -5px",
    borderLeft: "5px solid rgba(0, 0, 0, 0)",
    borderRight: "5px solid rgba(0, 0, 0, 0)",
    cursor: "col-resize",
  },
  ".Resizer.vertical:hover": {
    borderLeft: "5px solid rgba(0, 0, 0, 0.5)",
    borderRight: "5px solid rgba(0, 0, 0, 0.5)",
  },
  ".Resizer.disabled": { cursor: "auto" },
  ".Resizer.disabled:hover": { borderColor: "transparent" },
};

export const scrollbarLight = {
  "*:focus": { boxShadow: "0 0 0 0 rgba(0, 0, 0, 0) !important" },
  "::-webkit-scrollbar": { width: "8px" },
  "::-webkit-scrollbar-track": {
    background: "none",
    borderLeft: "1px red solid",
  },
  "::-webkit-scrollbar-thumb": { background: "#888" },
  "::-webkit-scrollbar-thumb:hover": { background: "#555" },
};

export const scrollbarDark = {
  "*:focus": { boxShadow: "0 0 0 0 rgba(0, 0, 0, 0) !important" },
  "::-webkit-scrollbar": { width: "8px" },
  "::-webkit-scrollbar-track": {
    background: "none",
    borderLeft: "1px red solid",
  },
  "::-webkit-scrollbar-thumb": { background: "#888" },
  "::-webkit-scrollbar-thumb:hover": { background: "#555" },
};

export const scrollbarHidden = {
  "::-webkit-scrollbar": { display: "none" },
};

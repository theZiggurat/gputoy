// credits to https://stackoverflow.com/questions/51338631/react-how-to-specify-animation-keyframes-and-classes-locally/51340161

import * as React from "react";

interface IProps {
  name: string;
  [key: string]: React.CSSProperties | string;
}

const Keyframes = (props: IProps) => {
  const toCss = (cssObject: React.CSSProperties | string) =>
    typeof cssObject === "string"
      ? cssObject
      : Object.keys(cssObject).reduce((accumulator, key) => {
        const cssKey = key.replace(/[A-Z]/g, v => `-${v.toLowerCase()}`);
        const cssValue = (cssObject as any)[key].toString().replace("'", "");
        return `${accumulator}${cssKey}:${cssValue};`;
      }, "");

  return (
    <style>
      {`@keyframes ${props.name} {
        ${Object.keys(props)
          .map(key => {
            return ["from", "to"].includes(key)
              ? `${key} { ${toCss(props[key])} }`
              : /^_[0-9]+$/.test(key)
                ? `${key.replace("_", "")}% { ${toCss(props[key])} }`
                : "";
          })
          .join(" ")}
      }`}
    </style>
  );
};

export default Keyframes
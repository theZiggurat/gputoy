import { useCallback, useEffect, useState } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { debounce, get } from "lodash";
import { set } from "lodash/fp";
import { nanoid } from "nanoid";

import { layoutAtom } from "@core/recoil/atoms/layout";
import { useInstanceCleaner } from "../useInstance";

type Location = "top" | "bottom" | "left" | "right";

export interface PanelProps {
  panelLayout: any;
  onSplitPanel: (
    path: string,
    direction: "horizontal" | "vertical",
    panelIndex: number
  ) => void;
  onCombinePanel: (path: string) => void;
  onSwitchPanel: (path: string, panelIndex: number) => void;
  onPanelSizeChange: (path: string, newSize: number, totalSize: number) => void;
  addPanel: (panelIndex: number, location: Location) => void;
  resetPanels: () => void;
  layoutSize: number[];
  windowGen: number;
  fixed?: boolean;
}

type PanelOptions = {
  fixed?: boolean;
  initialLayout?: any;
};

const usePanels = (options: PanelOptions): PanelProps => {
  const { fixed, initialLayout } = options;

  const [layout, setLayout] = useRecoilState(layoutAtom);
  const resetPanelTreeLayout = useResetRecoilState(layoutAtom);

  const [layoutSize, setLayoutSize] = useState([0, 0]);
  const [windowGen, setWindowGen] = useState(0);

  const cleaner = useInstanceCleaner();
  const clean = useCallback(
    debounce((layout: any) => {
      cleaner(instances(layout));
    }, 1000),
    [cleaner]
  );

  const handleWindowResize = debounce(
    () => {
      setLayoutSize([window.innerWidth, window.innerHeight - 45]);
      setWindowGen((i) => i + 1);
    },
    50,
    { leading: true, trailing: true }
  );
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    setLayoutSize([window.innerWidth, window.innerHeight - 45]);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    clean(layout);
  }, [layout]);

  const trySetLayout = (layout: any | undefined) => {
    if (layout !== undefined) setLayout(layout);
  };
  const onSplit = (
    path: string,
    direction: "horizontal" | "vertical",
    panelIndex: number
  ) => {
    trySetLayout(
      replaceAtPath(layout, path, (layout) => {
        const obj: any = {};
        obj["left"] = {
          instanceID: layout["instanceID"],
          index: layout["index"],
          type: "leaf",
        };
        obj["right"] = { instanceID: genID(), index: panelIndex, type: "leaf" };
        obj["index"] = -1;
        obj["type"] = direction;
        obj["instanceID"] = genID();
        return obj;
      })
    );
  };

  const onCombine = (path: string) => {
    const dir = path.charAt(path.length - 1) === "r" ? "left" : "right";
    trySetLayout(
      replaceAtPath(layout, path.substr(0, path.length - 1), (layout) => {
        const obj: any = {};
        const child = layout[dir];
        obj["index"] = child["index"];
        obj["instanceID"] = child["instanceID"];
        obj["type"] = child["type"];
        obj["left"] = child["left"];
        obj["right"] = child["right"];
        obj["size"] = child["size"];
        return obj;
      })
    );
  };

  const onSwitch = (path: string, panelIndex: number) => {
    if (get(layout, arrpath(path).concat("index")) === panelIndex) return;
    trySetLayout(
      replaceAtPath(layout, path, (layout) => {
        const obj: any = {};
        obj["index"] = panelIndex;
        obj["type"] = "leaf";
        obj["instanceID"] = genID();
        return obj;
      })
    );
  };

  const addPanel = (panelIndex: number, location: Location) => {
    trySetLayout((old) => {
      const newPanel = {
        index: panelIndex,
        type: "leaf",
        instanceID: nanoid(8),
      };
      const newLayout = {
        index: -1,
        type:
          location == "top" || location == "bottom" ? "horizontal" : "vertical",
        instanceID: nanoid(8),
        left: location == "top" || location == "left" ? newPanel : { ...old },
        right:
          location == "bottom" || location == "right" ? newPanel : { ...old },
        size: location == "top" || location == "left" ? 0.1 : 0.9,
      };
      return newLayout;
    });
  };

  const onPanelSizeChange = debounce(
    (path: string, newSize: number, totalSize: number) => {
      trySetLayout(
        replaceAtPath(layout, path, (layout) => {
          const obj: any = { ...layout };
          obj["size"] = newSize / totalSize;
          return obj;
        })
      );
    },
    100
  );

  const resetPanels = resetPanelTreeLayout;

  return {
    panelLayout: layout,
    onCombinePanel: onCombine,
    onSplitPanel: onSplit,
    onSwitchPanel: onSwitch,
    onPanelSizeChange,
    addPanel,
    resetPanels,
    layoutSize,
    windowGen,
    fixed,
  };
};

const arrpath = (path: string): string[] =>
  Array.from(path).map((c) => (c === "l" ? "left" : "right"));

const replaceAtPath = (
  obj: any,
  path: string,
  f: (obj: any) => any
): any | undefined => {
  const apath = arrpath(path);
  const objAtPath = apath.length == 0 ? obj : get(obj, apath);
  if (objAtPath === undefined) return false;
  return apath.length == 0 ? f(objAtPath) : set(apath, f(objAtPath), obj);
};

const instances = (obj: any, path: string = ""): any[] => {
  const selfID = get(obj, arrpath(path).concat("instanceID"));
  const selfIndex = get(obj, arrpath(path).concat("index"));
  return selfID === undefined
    ? []
    : [{ id: selfID, index: selfIndex < 0 ? undefined : selfIndex }]
        .concat(instances(obj, path.concat("l")))
        .concat(instances(obj, path.concat("r")));
};

const genID = () => nanoid(8);

export default usePanels;

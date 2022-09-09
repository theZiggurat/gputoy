import * as types from "@core/types";
import { atom, atomFamily, DefaultValue, selector } from "recoil";

export const projectFileDataAtom = atomFamily<string, string>({
  key: "projectFileData",
  default: "",
});

export const projectFileMetadataAtom = atomFamily<
  Omit<types.File, "data">,
  string
>({
  key: "projectFileMetadata",
  default: (fileId) => ({
    filename: "",
    path: "/",
    extension: "_ROOT",
    id: fileId,
    metadata: {},
  }),
});

export const projectFilesListAtom = atom<string[]>({
  key: "projectFiles",
  default: [],
});

export const withProjectFilesJSON = selector<{ [key: string]: types.File }>({
  key: "withProjectFilesJSON",
  get: ({ get }) => {
    let ret: { [key: string]: types.File } = {};
    const fileList = get(projectFilesListAtom);
    for (const fileId of fileList) {
      const fileData = get(projectFileDataAtom(fileId));
      const fileMetadata = get(projectFileMetadataAtom(fileId));
      ret[fileId] = { ...fileMetadata, data: fileData };
    }
    return ret;
  },
  set: ({ set, reset }, projectFiles) => {
    Object.entries(projectFiles).forEach(([id, file]) => {
      const { data, ...rest } = file;
      set(projectFileDataAtom(id), data);
      set(projectFileMetadataAtom(id), rest);
    });
    set(projectFilesListAtom, Object.keys(projectFiles));
  },
});

export const withProjectFilesMetadata = selector<{
  [key: string]: Omit<types.File, "data">;
}>({
  key: "withProjectFilesMetadata",
  get: ({ get }) => {
    let ret: { [key: string]: Omit<types.File, "data"> } = {};
    const fileList = get(projectFilesListAtom);
    for (const fileId of fileList) {
      const fileMetadata = get(projectFileMetadataAtom(fileId));
      ret[fileId] = fileMetadata;
    }
    return ret;
  },
  set: ({ set, reset }, projectFiles) => {
    Object.entries(projectFiles).forEach(([id, file]) => {
      set(projectFileMetadataAtom(id), file);
    });
    set(projectFilesListAtom, Object.keys(projectFiles));
  },
});

/**
 * Allows components to set files directly without having to subscribe to an induvidual
 * file atom
 */
export const withFileSetter = selector<{
  id: string;
  file?: Partial<types.File>;
}>({
  key: "withFileSetter",
  // useless
  get: ({ get }) => ({} as { id: string; file: types.File }),
  // setter will be used for push and delete file in UI
  set: ({ set, reset }, arg) => {
    if (!(arg instanceof DefaultValue)) {
      const { id, file } = arg;

      // delete file data, metadata, and list entry
      if (!file) {
        reset(projectFileDataAtom(id));
        set(projectFileMetadataAtom(id), {
          extension: "_DELETED",
          filename: "",
          id: id,
          path: "",
          metadata: {},
        });
        set(projectFilesListAtom, (prev) => {
          let newids = [...prev];
          const remove = prev.indexOf(id);
          if (remove === -1) return prev;
          newids.splice(remove, 1);
          return newids;
        });
        return;
      }

      // set file at id and add to file list if not there
      const { data, ...rest } = file;
      if (data) {
        set(projectFileDataAtom(id), data);
      }
      if (rest) {
        set(projectFileMetadataAtom(id), (prev) => ({ ...prev, ...rest }));
      }

      set(projectFilesListAtom, (prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    }
  },
});

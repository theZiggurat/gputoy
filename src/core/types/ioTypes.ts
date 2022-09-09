import { ResourceInstance, Model, Namespace } from ".";
import { Logger } from "@core/recoil/atoms/console";
import { Resource } from "./resourceTypes";

export type IOType = "viewport" | "file";
export type IOArgs = ViewportIOArgs | KeyboardIOArgs | FileIOArgs | StateIOArgs;

export type ViewportIOArgs = {
  canvasId: string;
  mouseId: string;
};

export type KeyboardIOArgs = {};

export type FileIOArgs = {
  fileId: string;
};

export type StateIOArgs = {};
export type StateIOMessage = StateIOArgs;
/**
 * Holds serializable info about an IO channel
 * These will be created when a component in the react tree
 * uses useIOChannel
 */
export type IOChannel = {
  id: string;
  label: string;
  ioType: IOType;
  args: IOArgs;
};

/**
 * Handles the io during runtime
 * Created on build from IOSync objects obtained from recoil values
 */
export interface IO {
  /**
   * This will be used as webgpu internal label, along with console messages
   */
  label: string;

  /**
   * Static io type
   *
   *  TODO: investigate whether this is needed
   */
  type: IOType;

  /**
   *
   */
  usage: "read" | "write" | "readwrite";

  /**
   * Build io using selected arguments.
   * On fail, returns false.
   * IO not valid for use until build has returned true.
   * IO is valid until an external event (layout change, device lost)
   * occurs when it will need to be rebuilt.
   */
  build: (args: IOArgs, label: string, logger?: Logger) => Promise<boolean>;

  /**
   * Invalidate all gpu resources and close io connections
   */
  destroy: (logger?: Logger) => void;

  /**
   * Called at the beginning of every frame
   * @param queue current queue
   */
  onBeginDispatch: (queue: GPUQueue) => void;

  /**
   * Called at the end of every frame
   */
  onEndDispatch: (queue: GPUQueue) => void;

  /**
   * Gets shader namespace declarations of this io
   */
  getNamespace: () => Namespace;

  /**
   * Get resource descriptors associated with this io
   *
   * resource name => resource descriptor
   */
  getResources: () => Record<string, Resource>;

  /**
   * Gets gpu resources associated with this io
   *
   * resource name => resource instance
   */
  getResourceInstances: () => Record<string, ResourceInstance>;
}

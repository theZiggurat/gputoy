import { ExtensionShader } from ".";

/**
 * TODO: add mat4, vec4f, vec4i, and rgba
 */
export type ConstructableType =
  | "int"
  | "float"
  | "color"
  | "vec3f"
  | "vec2f"
  | "vec3i"
  | "vec2i";
export const SHADER_TYPE_META = {
  int: {
    size: 4,
    align: 4,
    order: 6,
    glsl: "int",
    wgsl: "i32",
    writeType: "int",
  },
  float: {
    size: 4,
    align: 4,
    order: 3,
    glsl: "float",
    wgsl: "f32",
    writeType: "float",
  },
  color: {
    size: 12,
    align: 16,
    order: 1,
    glsl: "vec3",
    wgsl: "vec3<f32>",
    writeType: "float",
  },
  vec3f: {
    size: 12,
    align: 16,
    order: 0,
    glsl: "vec3",
    wgsl: "vec3<f32>",
    writeType: "float",
  },
  vec3i: {
    size: 12,
    align: 16,
    order: 4,
    glsl: "ivec3",
    wgsl: "vec3<i32>",
    writeType: "int",
  },
  vec2f: {
    size: 8,
    align: 8,
    order: 2,
    glsl: "vec2",
    wgsl: "vec2<f32>",
    writeType: "float",
  },
  vec2i: {
    size: 8,
    align: 8,
    order: 5,
    glsl: "ivec2",
    wgsl: "vec2<i32>",
    writeType: "int",
  },
} as const;

export type Model = {
  name: string;
  definingFileId: string;
  dependentFileIds: string[];
  namedTypes: Record<string, number>;
  indexedTypes: NagaType[];
};

export type ValidationResult = {
  fileId: string;
  errors?: string;
  // wgsl that is ready for device.createModule()
  processedShader?: string;
  nagaModule?: NagaModule;
};

export const getStructFromModel = (
  model: Model,
  structName: string
): NagaTypeStructFull | null => {
  const type = model.indexedTypes[model.namedTypes[structName] - 1];
  if (!type || !("Struct" in type.inner)) return null;
  const { members, span } = type.inner.Struct;
  return {
    name: structName,
    span,
    members: members.map((m) => ({ ...m, ty: model.indexedTypes[m.ty - 1] })),
  };
};

export const getStructFromNamespaces = (
  namespaces: Record<string, Namespace>,
  structName: string
): NagaTypeStructFull | null => {
  let model = null;
  for (const namespace of Object.values(namespaces)) {
    model = getStructFromModel(namespace.exported, structName);
    if (model) break;
  }
  return model;
};

export const getStructDecl = (
  struct: NagaTypeStructFull,
  ext: ExtensionShader
): string => {
  let decl = [];
  decl.push(`struct ${struct.name} {`);
  if (ext === "wgsl") {
    decl.push(
      struct.members
        .map((e) => {
          const { name, binding, offset, ty } = e;

          const parsedBinding = bindingToString(binding);
          const innerType = getTypeDecl(ty, ext);
          return `\t${parsedBinding} ${name}: ${innerType},`;
        })
        .join("\n")
    );
  } else {
    decl.push(
      struct.members
        .map((e) => {
          const { name, binding, offset, ty } = e;
          const innerType = getTypeDecl(ty, ext);
          return `\t${innerType}: ${name};`;
        })
        .join("\n")
    );
  }
  decl.push("};");
  return decl.join("\n");
};

export const getTypeDecl = (
  type: NagaType,
  ext: ExtensionShader,
  inline?: boolean
): string => {
  const { inner } = type;
  if ("Scalar" in inner) {
    const { kind } = inner.Scalar;
    return scalarTypeMap[kind][ext];
  }
  if ("Vector" in inner) {
    const { kind, size, width } = inner.Vector;
    const num = VECTOR_SIZE_MAP[size];
    return ext === "wgsl"
      ? `vec${num}<${scalarTypeMap[kind]["wgsl"]}>`
      : `${GLSL_VECTOR_PREFIX_MAP[kind]}vec${num}`;
  }
  return "";
};

export const bindingToString = (binding: NagaBinding | null): string => {
  if (!binding) return "";
  if ("BuiltIn" in binding) {
    const builtin =
      WGSL_BUILTIN_VARIANTS[NAGA_BUILTIN_VARIANTS.indexOf(binding.BuiltIn)];
    return `@builtin(${builtin})`;
  } else if ("Location" in binding) {
    const location = binding.Location;
    const interpolation =
      location.interpolation?.toLowerCase() ?? "perspective";
    const sampling = location.sampling?.toLowerCase() ?? "center";
    return `@location(${location.location}) @interpolate(${interpolation}, ${sampling})`;
  }
  return "";
};

export type NagaStructMemoryLayout = {
  // Indexed type enum of member
  // 1: Sint
  // 2: Uint
  // 3: Float
  // 4: Bool
  scalarTypes: number[];
  // Offset of each member in bytes
  byteOffsets: number[];
  // Size of each member in bytes
  memberSizes: number[];
  // Total size of struct in bytes
  byteSize: number;
};
export const getMemoryLayout = (
  type: NagaTypeStructFull
): NagaStructMemoryLayout => {
  const { members } = type;
  let scalarTypes: number[] = [];
  let byteOffsets: number[] = [];
  let memberSizes: number[] = [];
  members.forEach((member, idx) => {
    const inner = member.ty.inner;
    if ("Scalar" in inner) {
      scalarTypes[idx] = NAGA_SCALAR_KIND_VARIANTS.indexOf(inner.Scalar.kind);
      memberSizes[idx] = inner.Scalar.width;
    } else if ("Vector" in inner) {
      scalarTypes[idx] = NAGA_SCALAR_KIND_VARIANTS.indexOf(inner.Vector.kind);
      memberSizes[idx] = inner.Vector.width;
    }
    byteOffsets[idx] = member.offset as number;
  });
  return {
    scalarTypes,
    byteOffsets,
    memberSizes,
    byteSize: memberSizes.reduce((prev, curr) => prev + curr),
  };
};

export type Dependency = {
  identifier: string;
  inline?: boolean;
};

export type Namespace = {
  exported: Model;
  imported: Dependency[];
};

/**
 * Holds data and metadata for single parameter in uniform
 */
export type ParamDesc = {
  paramName?: string;
  paramType: ConstructableType;
  param: number[];
  key?: string;
  interface?: number;
  interfaceProps?: any;
};

/**
 * Here down it is direct translation of naga::Type struct
 */
export type NagaType = {
  name: string | null;
  inner: NagaTypeInner;
};

export type NagaTypeInner =
  | { Scalar: NagaTypeScalar }
  | { Vector: NagaTypeVector }
  | { Matrix: NagaTypeMatrix }
  | { Atomic: NagaTypeAtomic }
  | { Pointer: NagaTypePointer }
  | { ValuePointer: NagaTypeValuePointer }
  | { Array: NagaTypeArray }
  | { Struct: NagaTypeStruct }
  | { Image: NagaTypeImage }
  | { Sampler: NagaTypeSampler };

export type NagaTypeScalar = {
  kind: NagaScalarKind;
  width: number;
};
export type NagaTypeVector = {
  size: NagaVectorSize;
  kind: NagaScalarKind;
  width: number;
};
export type NagaTypeMatrix = {
  columns: NagaVectorSize;
  rows: NagaVectorSize;
  width: number;
};
export type NagaTypeAtomic = {
  kind: NagaScalarKind;
  width: number;
};
export type NagaTypePointer = {
  // Handle<type> -> 1 based index
  base: number;
  class: NagaStorageClass;
};
export type NagaTypeValuePointer = {
  size: NagaVectorSize | null;
  kind: NagaScalarKind;
  width: number;
  class: NagaStorageClass;
};
export type NagaTypeArray = {
  // Handle<type> -> 1 based index
  base: number;
  // TODO: find how this serializes
  size: any;
  stride: number;
};

export type NagaTypeStruct = {
  members: NagaStructMember[];
  span: number;
};

export type NagaTypeImage = {
  dim: NagaImageDimension;
  arrayed: boolean;
  class: NagaImageClass;
};

export type NagaTypeSampler = {
  comparison: boolean;
};

export type NagaStructMember = {
  name: string | null;
  // Handle<Type>: 1 based index on types
  ty: number;
  // TODO: find how this serializes
  binding: NagaBinding | null;
  offset: number;
};

export type NagaTypeStructFull = {
  name: string;
  members: NagaStructFullMembers[];
  span: number;
};

export type NagaStructFullMembers = {
  name: string | null;
  ty: NagaType;
  binding: NagaBinding | null;
  offset: Number;
};

export type ShaderMapping = { wgsl: string; glsl: string };
const scalarTypeMap: Record<NagaScalarKind, ShaderMapping> = {
  Bool: { wgsl: "bool", glsl: "bool" },
  Float: { wgsl: "f32", glsl: "float" },
  Sint: { wgsl: "i32", glsl: "int" },
  Uint: { wgsl: "u32", glsl: "uint" },
};
const VECTOR_SIZE_MAP: Record<NagaVectorSize, number> = {
  Bi: 2,
  Tri: 3,
  Quad: 4,
};
const GLSL_VECTOR_PREFIX_MAP: Record<NagaScalarKind, string> = {
  Bool: "b",
  Float: "",
  Sint: "i",
  Uint: "u",
};
export const NAGA_SCALAR_KIND_VARIANTS = [
  "Sint",
  "Uint",
  "Float",
  "Bool",
] as const;
export const NAGA_VECTOR_SIZE_VARIANTS = ["Bi", "Tri", "Quad"] as const;
export const NAGA_BUILTIN_VARIANTS = [
  "Position",
  "ViewIndex",
  "BaseInstance",
  "BaseVertex",
  "ClipDistance",
  "CullDistance",
  "InstanceIndex",
  "PointSize",
  "VertexIndex",
  "FragDepth",
  "FrontFacing",
  "PrimitiveIndex",
  "SampleIndex",
  "SampleMask",
  "GlobalInvocationId",
  "LocalInvocationId",
  "LocalInvocationIndex",
  "WorkGroupId",
  "WorkGroupSize",
  "NumWorkGroups",
] as const;
export const WGSL_BUILTIN_VARIANTS = [
  "position",
  "",
  "",
  "",
  "",
  "",
  "instance_index",
  "",
  "vertex_index",
  "frag_depth",
  "front_facing",
  "",
  "sample_index",
  "sample_mask",
  "global_invocation_id",
  "local_invocation_id",
  "local_invocation_index",
  "workgroup_id",
  "",
  "num_workgroups",
] as const;
export const NAGA_STORAGE_CLASS_VARIANTS = [
  "Function",
  "Private",
  "Workgroup",
  "Uniform",
  "Handle",
  "PushConstant",
] as const;
export const NAGA_STORAGE_FORMAT_VARIANTS = [
  "R8Unorm",
  "R8Snorm",
  "R8Uint",
  "R8Sint",
  "R16Uint",
  "R16Sint",
  "R16Float",
  "Rg8Unorm",
  "Rg8Snorm",
  "Rg8Uint",
  "Rg8Sint",
  "R32Uint",
  "R32Sint",
  "R32Float",
  "Rg16Uint",
  "Rg16Sint",
  "Rg16Float",
  "Rgba8Unorm",
  "Rgba8Snorm",
  "Rgba8Uint",
  "Rgba8Sint",
  "Rgb10a2Unorm",
  "Rg11b10Float",
  "Rg32Uint",
  "Rg32Sint",
  "Rg32Float",
  "Rgba16Uint",
  "Rgba16Sint",
  "Rgba16Float",
  "Rgba32Uint",
  "Rgba32Sint",
  "Rgba32Float",
];
export const NAGA_INTERPOLATION_VARIANTS = [
  "Perspective",
  "Linear",
  "Flat",
] as const;
export const NAGA_SAMPLING_VARIANTS = ["Center", "Centroid", "Sample"] as const;
export const NAGA_IMAGE_DIMENSION_VARIANTS = [
  "D1",
  "D2",
  "D3",
  "Cube",
] as const;

export type NagaScalarKind = typeof NAGA_SCALAR_KIND_VARIANTS[number];
export type NagaVectorSize = typeof NAGA_VECTOR_SIZE_VARIANTS[number];
export type NagaBuiltin = typeof NAGA_BUILTIN_VARIANTS[number];
export type NagaInterpolation = typeof NAGA_INTERPOLATION_VARIANTS[number];
export type NagaSampling = typeof NAGA_SAMPLING_VARIANTS[number];
export type NagaStorageClass =
  | typeof NAGA_STORAGE_CLASS_VARIANTS[number]
  | {
      Storage: {
        access: NagaStorageAccess;
      };
    };
export type NagaImageDimension = typeof NAGA_IMAGE_DIMENSION_VARIANTS[number];
export type NagaImageClass =
  | {
      Sampled: {
        kind: NagaScalarKind;
        multi: boolean;
      };
    }
  | {
      Depth: {
        multi: boolean;
      };
    }
  | {
      Storage: {
        format: NagaStorageFormat;
        access: NagaStorageAccess;
      };
    };

export type NagaBinding =
  | {
      BuiltIn: NagaBuiltin;
    }
  | {
      Location: {
        location: number;
        interpolation?: NagaInterpolation;
        sampling?: NagaSampling;
      };
    };

export type NagaStorageFormat = typeof NAGA_STORAGE_FORMAT_VARIANTS[number];
export type NagaStorageAccess = {
  bits: NagaStorageAccessFlagEnum;
};

export enum NagaStorageAccessFlagEnum {
  NONE = 0,
  LOAD = 1,
  STORE = 2,
  ALL = 3,
}

export type NagaResourceBinding = {
  group: number;
  binding: number;
};

export type NagaConstantInner =
  | {
      Composite: {
        width: number;
        value:
          | {
              Float: number;
            }
          | {
              Uint: number;
            }
          | {
              Sint: number;
            }
          | {
              Bool: boolean;
            };
      };
    }
  | {
      Composite: {
        // Handle<Type>
        ty: number;
        // Handle<Constant>[]
        components: number[];
      };
    };

export type NagaConstant = {
  name?: string;
  specialization?: number;
  inner: NagaConstantInner;
};

export type NagaModule = {
  types: NagaType[];
  constants: NagaConstant[];
  global_variables: NagaGlobalVariable[];
  functions: NagaFunction[];
  entry_points: NagaEntryPoint[];
};

export type NagaGlobalVariable = {
  name?: string;
  class: NagaStorageClass;
  binding: NagaResourceBinding;
  // Handle<Type>
  ty: number;
  // Handle<Constant>
  init?: number;
};

export type NagaFunction = {
  name?: string;
  arguments: NagaFunctionArgument[];
  result?: NagaFunctionResult;

  // maybe down the line these can be maken use of
  // but its a bit overkill for now
  local_variables: any;
  expressions: any;
  named_expressions: any;
  body: any;
};

export type NagaFunctionArgument = {
  name?: string;
  // Handle<Type>
  ty: number;
  binding?: NagaBinding;
};

export type NagaFunctionResult = {
  // Handle<Type>
  ty: number;
  binding?: NagaBinding;
};

export type NagaShaderStage = "Vertex" | "Fragment" | "Compute";

export type NagaEntryPoint = {
  name: string;
  stage: NagaShaderStage;
  // TODO: find how this serializes
  early_depth_test?: any;
  workgroup_size: number[];
  function: NagaFunction;
};

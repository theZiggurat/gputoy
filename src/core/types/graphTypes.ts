import { IOType } from "."

export type Rendergraph = {
  passNodes: Record<string, PassNode>
  ioNodes: Record<string, IONode>
  connections: GraphConnector[]
}

export type PassNode = {
  id: string
  label: string
  fileId: string
  passType: 'render' | 'compute'
}



export type IONode = {
  id: string
  mode: 'read' | 'write'
  type: IOType
  disabled?: boolean
  args: any
}

export type GraphNodeType = 'io' | 'pass'
export type GraphConnector = {
  src: {
    type: GraphNodeType,
    id: string
  },
  dst: {
    type: GraphNodeType,
    id: string
  }
}
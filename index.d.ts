export interface ConnectionPointCoordinates {
  x: number
  y: number
  pointId?: string
  pcb_port_id?: string
}

export type ConnectionPoint = ConnectionPointCoordinates &
  ({ layer: string; layers?: never } | { layers: string[]; layer?: never })

export interface SimpleRouteJson {
  layerCount: number
  minTraceWidth: number
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  outline?: Array<{ x: number; y: number }>
  connections: Array<{
    name: string
    source_trace_id?: string
    rootConnectionName?: string
    pointsToConnect: ConnectionPoint[]
  }>
  obstacles: Array<{
    type: "rect"
    obstacleId?: string
    componentId?: string
    layers: string[]
    center: { x: number; y: number }
    width: number
    height: number
    connectedTo: string[]
    ccwRotationDegrees?: number
  }>
}

export const sample001: SimpleRouteJson
export const sample002: SimpleRouteJson
export const sample003: SimpleRouteJson
export const sample004: SimpleRouteJson
export const dataset: {
  sample001: SimpleRouteJson
  sample002: SimpleRouteJson
  sample003: SimpleRouteJson
  sample004: SimpleRouteJson
}
export default dataset

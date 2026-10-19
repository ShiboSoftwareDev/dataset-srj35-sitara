import { convertSrjToGraphicsObject } from "@tscircuit/capacity-autorouter"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { stackSvgsHorizontally } from "stack-svgs"

export function createComparisonSvg({
  altiumSvg,
  circuitJson,
  simpleRouteJson,
  boardName,
}) {
  const board = circuitJson.find((element) => element.type === "pcb_board")
  if (!board) throw new Error(`${boardName}: missing PCB board`)
  const circuitJsonSvg = convertCircuitJsonToPcbSvg(circuitJson, {
    width: 800,
    height: 800,
    layer: "top",
    viewportTarget: { pcb_board_id: board.pcb_board_id },
    matchBoardAspectRatio: true,
    includeVersion: false,
  })
  const srjSvg = getSvgFromGraphicsObject(
    convertSrjToGraphicsObject(simpleRouteJson),
    {
      svgWidth: 800,
      svgHeight: 800,
      hideInlineLabels: true,
    },
  )
  return stackSvgsHorizontally([altiumSvg, circuitJsonSvg, srjSvg], {
    gap: 24,
    normalizeSize: true,
    targetSize: 800,
    rootAttributes: {
      "aria-label": `${boardName}: original Altium, converted Circuit JSON, unrouted Simple Route JSON`,
      role: "img",
    },
  }).replace(
    /<\/svg>\s*$/,
    '<g font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#777"><text x="400" y="22">Altium: top copper</text><text x="1224" y="22">Circuit JSON: top copper</text><text x="2048" y="22">SRJ: all routing layers</text></g></svg>',
  )
}

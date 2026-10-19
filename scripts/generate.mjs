import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { gzipSync } from "node:zlib"
import {
  getSimpleRouteJsonFromCircuitJson,
  unrouteCircuitJson,
} from "@tscircuit/core"
import {
  convertAltiumToCircuitJson,
  convertAltiumProjectToCircuitJson,
} from "altium-to-circuit-json"
import {
  AltiumPrjPcb,
  parseAltiumFile,
  parseAltiumSchDoc,
  parseAltiumBinaryPcbDoc,
  serializeAltiumPcbToSvg,
} from "altiumts"
import { boards } from "./boards.mjs"
import { readSourceFiles } from "./read-source-files.mjs"
import { writeSample } from "./write-sample.mjs"

for (const directory of ["samples", "circuit-json", "source-svg"]) {
  await mkdir(directory, { recursive: true })
}
const converterVersions = Object.fromEntries(
  await Promise.all(
    [
      "altium-to-circuit-json",
      "altiumts",
      "@tscircuit/core",
      "circuit-to-svg",
      "@tscircuit/capacity-autorouter",
    ].map(async (packageName) => [
      packageName,
      JSON.parse(
        await readFile(`node_modules/${packageName}/package.json`, "utf8"),
      ).version,
    ]),
  ),
)
const requestedBoardIds = new Set(process.argv.slice(2))
const sourceFiles =
  requestedBoardIds.size === 0
    ? []
    : JSON.parse(await readFile("source-files.json", "utf8")).filter(
        (board) => !requestedBoardIds.has(board.id),
      )
for (const board of boards.filter(
  ({ id }) => requestedBoardIds.size === 0 || requestedBoardIds.has(id),
)) {
  console.log(`${board.name}: reading checksum-pinned source`)
  const { pcbBytes, projectBytes, schematics } = await readSourceFiles(board)
  const project = parseAltiumFile(projectBytes).document
  if (!(project instanceof AltiumPrjPcb))
    throw new Error(`${board.name}: invalid Altium project`)
  const document = parseAltiumBinaryPcbDoc(pcbBytes)
  const circuitJson =
    schematics.length > 0
      ? convertAltiumProjectToCircuitJson({
          pcb: { document, options: { project } },
          schematics: schematics.map(({ filename, bytes }) => ({
            document: parseAltiumSchDoc(bytes),
            options: { project, documentName: filename },
          })),
        })
      : convertAltiumToCircuitJson(pcbBytes, {
          sourceType: "pcb",
          pcb: { project },
        })
  const { simpleRouteJson } = getSimpleRouteJsonFromCircuitJson({
    circuitJson: unrouteCircuitJson(circuitJson),
    ignoreExistingTopLevelPcbRouteState: true,
  })
  if (simpleRouteJson.connections.length === 0) {
    throw new Error(`${board.name}: full-board SRJ has no connected nets`)
  }
  const bounds = document.boardGeometry.outline.bounds
  if (!bounds) throw new Error(`${board.name}: missing Altium outline`)
  const padding =
    Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.05
  const altiumSvg = serializeAltiumPcbToSvg(document, {
    width: 800,
    height: 800,
    layers: ["TOP", "TOPOVERLAY", "MULTILAYER"],
    title: `${board.name}: original Altium top copper`,
    viewBox: {
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      width: bounds.maxX - bounds.minX + 2 * padding,
      height: bounds.maxY - bounds.minY + 2 * padding,
    },
  })
  const circuitJsonBytes = gzipSync(JSON.stringify(circuitJson))
  await writeFile(
    `circuit-json/${board.sample}.circuit.json.gz`,
    circuitJsonBytes,
  )
  await writeSample({ sampleName: board.sample, simpleRouteJson })
  await writeFile(`source-svg/${board.sample}.svg`, altiumSvg)
  sourceFiles.push({
    ...board,
    converterVersions,
    altiumConverterCommit: "a9b8bd37e77bcb35790d91d2d033ed58d8a49a7b",
    altiumtsCommit: "50434443e86e4598b653cbdbed9d204649c905f2",
    circuitJsonSha256: createHash("sha256")
      .update(circuitJsonBytes)
      .digest("hex"),
    circuitJsonPath: `circuit-json/${board.sample}.circuit.json.gz`,
    comparisonSvg: `tests/__snapshots__/${board.sample}.snap.svg`,
    routingInput:
      "Core unrouteCircuitJson followed by getSimpleRouteJsonFromCircuitJson; no geometry or connectivity repairs",
    stats: {
      layerCount: simpleRouteJson.layerCount,
      connections: simpleRouteJson.connections.length,
      endpoints: simpleRouteJson.connections.reduce(
        (total, connection) => total + connection.pointsToConnect.length,
        0,
      ),
      obstacles: simpleRouteJson.obstacles.length,
    },
  })
  console.log(
    `${board.sample}: ${simpleRouteJson.connections.length} nets, ${simpleRouteJson.obstacles.length} obstacles`,
  )
}
await writeFile(
  "source-files.json",
  `${JSON.stringify(
    sourceFiles.sort((firstBoard, secondBoard) =>
      firstBoard.sample.localeCompare(secondBoard.sample),
    ),
    null,
    2,
  )}\n`,
)

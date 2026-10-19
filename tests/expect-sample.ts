import { expect } from "bun:test"
import { readFile } from "node:fs/promises"
import { gunzipSync } from "node:zlib"
import {
  getSimpleRouteJsonFromCircuitJson,
  unrouteCircuitJson,
} from "@tscircuit/core"
import type { CircuitJson } from "circuit-json"
import { dataset } from "../index.js"
import { createComparisonSvg } from "../scripts/create-comparison-svg.mjs"

type SampleName = keyof typeof dataset

export async function expectSample({
  sampleName,
  boardName,
  testPath,
}: {
  sampleName: SampleName
  boardName: string
  testPath: string
}): Promise<void> {
  const circuitJson = JSON.parse(
    gunzipSync(
      await readFile(`circuit-json/${sampleName}.circuit.json.gz`),
    ).toString("utf8"),
  ) as CircuitJson
  const { simpleRouteJson } = getSimpleRouteJsonFromCircuitJson({
    circuitJson: unrouteCircuitJson(circuitJson),
    ignoreExistingTopLevelPcbRouteState: true,
  })
  expect(simpleRouteJson).toEqual(dataset[sampleName])
  expect(simpleRouteJson.connections.length).toBeGreaterThan(0)
  expect(simpleRouteJson.obstacles.length).toBeGreaterThan(0)
  expect(simpleRouteJson.traces ?? []).toHaveLength(0)
  const altiumSvg = await readFile(`source-svg/${sampleName}.svg`, "utf8")
  await expect(
    createComparisonSvg({ altiumSvg, circuitJson, simpleRouteJson, boardName }),
  ).toMatchSvgSnapshot(testPath)
}

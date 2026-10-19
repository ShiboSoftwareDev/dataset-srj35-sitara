import { mkdir, unlink, writeFile } from "node:fs/promises"

export async function writeSample({ sampleName, simpleRouteJson }) {
  const sampleDirectory = `samples/${sampleName}`
  await mkdir(sampleDirectory, { recursive: true })
  const { obstacles, connections, ...board } = simpleRouteJson
  await writeFile(`${sampleDirectory}/board.json`, `${JSON.stringify(board)}\n`)
  await writeFile(
    `${sampleDirectory}/connections.json`,
    `${JSON.stringify(connections)}\n`,
  )
  const obstacleImports = []
  // Full-board connectedTo lists repeat all aliases of large power nets. Keep
  // every field, splitting JSON arrays to stay below GitHub's 100 MiB limit.
  for (
    let obstacleIndex = 0;
    obstacleIndex < obstacles.length;
    obstacleIndex += 128
  ) {
    const filename = `obstacles${String(obstacleImports.length + 1).padStart(3, "0")}.json`
    await writeFile(
      `${sampleDirectory}/${filename}`,
      `${JSON.stringify(obstacles.slice(obstacleIndex, obstacleIndex + 128))}\n`,
    )
    obstacleImports.push(`    ...require("./${filename}"),`)
  }
  await writeFile(
    `${sampleDirectory}/index.js`,
    [
      '"use strict"',
      "module.exports = {",
      '  ...require("./board.json"),',
      '  connections: require("./connections.json"),',
      "  obstacles: [",
      ...obstacleImports,
      "  ],",
      "}",
      "",
    ].join("\n"),
  )
  try {
    await unlink(`samples/${sampleName}.json`)
  } catch (error) {
    if (error.code !== "ENOENT") throw error
  }
}

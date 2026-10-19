import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { unzipSync } from "fflate"

export function verifySha256(bytes, expectedSha256) {
  const actualSha256 = createHash("sha256").update(bytes).digest("hex")
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `Source checksum mismatch: expected ${expectedSha256}, received ${actualSha256}`,
    )
  }
}

export async function readSourceFiles(board) {
  const sourceRoot = process.env.SITARA_ALTIUM_SOURCE_ROOT
  if (sourceRoot) {
    const pcbBytes = await readFile(join(sourceRoot, board.pcb.sourcePath))
    const projectBytes = await readFile(
      join(sourceRoot, board.project.sourcePath),
    )
    verifySha256(pcbBytes, board.pcb.sha256)
    verifySha256(projectBytes, board.project.sha256)
    const schematics = await Promise.all(
      (board.schematics ?? []).map(async (schematic) => {
        const bytes = await readFile(join(sourceRoot, schematic.sourcePath))
        verifySha256(bytes, schematic.sha256)
        return { filename: schematic.archivePath, bytes }
      }),
    )
    return { pcbBytes, projectBytes, schematics }
  }
  await mkdir(".cache", { recursive: true })
  const archivePath = join(".cache", `${board.id}.zip`)
  let archiveBytes
  try {
    archiveBytes = await readFile(archivePath)
  } catch (error) {
    if (error.code !== "ENOENT") throw error
    const response = await fetch(board.url)
    if (!response.ok) throw new Error(`${board.url}: HTTP ${response.status}`)
    archiveBytes = new Uint8Array(await response.arrayBuffer())
    verifySha256(archiveBytes, board.archiveSha256)
    await writeFile(archivePath, archiveBytes)
  }
  verifySha256(archiveBytes, board.archiveSha256)
  let entries = unzipSync(archiveBytes)
  if (board.nestedArchivePath) {
    const nestedArchive = entries[board.nestedArchivePath]
    if (!nestedArchive)
      throw new Error(`Missing nested archive: ${board.nestedArchivePath}`)
    verifySha256(nestedArchive, board.nestedArchiveSha256)
    entries = unzipSync(nestedArchive)
  }
  const pcbBytes = entries[board.pcb.archivePath]
  const projectBytes = entries[board.project.archivePath]
  if (!pcbBytes || !projectBytes)
    throw new Error(`${board.name}: missing PCB or project`)
  verifySha256(pcbBytes, board.pcb.sha256)
  verifySha256(projectBytes, board.project.sha256)
  const schematics = (board.schematics ?? []).map((schematic) => {
    const bytes = entries[schematic.archivePath]
    if (!bytes) throw new Error(`Missing schematic: ${schematic.archivePath}`)
    verifySha256(bytes, schematic.sha256)
    return { filename: schematic.archivePath, bytes }
  })
  return { pcbBytes, projectBytes, schematics }
}

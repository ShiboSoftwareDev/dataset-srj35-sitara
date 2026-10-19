import { test } from "bun:test"
import { expectSample } from "./expect-sample"

test(
  "SK-AM62: full-board Altium / Circuit JSON / SRJ comparison",
  async () => {
    await expectSample({
      sampleName: "sample002",
      boardName: "SK-AM62",
      testPath: import.meta.path,
    })
  },
  { timeout: 120_000 },
)

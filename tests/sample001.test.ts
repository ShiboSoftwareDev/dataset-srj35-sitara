import { test } from "bun:test"
import { expectSample } from "./expect-sample"

test(
  "TMDS62LEVM: full-board Altium / Circuit JSON / SRJ comparison",
  async () => {
    await expectSample({
      sampleName: "sample001",
      boardName: "TMDS62LEVM",
      testPath: import.meta.path,
    })
  },
  { timeout: 120_000 },
)

import { test } from "bun:test"
import { expectSample } from "./expect-sample"

test(
  "BeaglePlay: full-board Altium / Circuit JSON / SRJ comparison",
  async () => {
    await expectSample({
      sampleName: "sample003",
      boardName: "BeaglePlay",
      testPath: import.meta.path,
    })
  },
  { timeout: 120_000 },
)

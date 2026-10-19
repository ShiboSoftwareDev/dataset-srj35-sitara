import { test } from "bun:test"
import { expectSample } from "./expect-sample"

test(
  "BeagleBone Black: full-board Altium / Circuit JSON / SRJ comparison",
  async () => {
    await expectSample({
      sampleName: "sample004",
      boardName: "BeagleBone Black",
      testPath: import.meta.path,
    })
  },
  { timeout: 120_000 },
)

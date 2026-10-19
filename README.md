# Sitara SRJ35

Four full Sitara boards from the demo, converted through Altium → Circuit JSON → Core's Simple Route JSON exporter. Existing routes are omitted from SRJ; source copper, placement, and connectivity are retained in the Circuit JSON inputs. Conversion output is recorded without geometry or connectivity repairs.

| Sample | Board | Processor | Comparison |
| --- | --- | --- | --- |
| sample001 | TMDS62LEVM | AM62L | [Altium / Circuit JSON / SRJ](tests/__snapshots__/sample001.snap.svg) |
| sample002 | SK-AM62 | AM6254 | [Altium / Circuit JSON / SRJ](tests/__snapshots__/sample002.snap.svg) |
| sample003 | BeaglePlay | AM6254 | [Altium / Circuit JSON / SRJ](tests/__snapshots__/sample003.snap.svg) |
| sample004 | BeagleBone Black | AM335x | [Altium / Circuit JSON / SRJ](tests/__snapshots__/sample004.snap.svg) |

Install directly from GitHub at a commit, as with SRJ24. The package uses plain `index.js`, lightweight `index.d.ts`, and checked-in JSON; it requires no build or npm publication.

Full-board obstacle aliases make some samples larger than GitHub's 100 MiB
file limit. Each `samples/sampleNNN/index.js` combines static JSON chunks into
the exact Core export. No aliases, terminals, or geometry are discarded.

```sh
bun add -D github:ShiboSoftwareDev/dataset-srj35-sitara#COMMIT
bun install
bun run generate
bun test
```

`scripts/boards.mjs` pins each source archive, nested archive, PCB, and project checksum. Generation downloads into ignored `.cache/`, verifies every checksum, and calls the published converters. `source-files.json` records installed versions, hashes, and sample statistics. Native Altium files are not redistributed.

Each test re-exports its Circuit JSON using Core and checks the SRJ and a labeled comparison SVG. Update intentional visual baselines with `BUN_UPDATE_SNAPSHOTS=1 bun test -u`.

Repository code is MIT licensed. TI-derived assets remain subject to [TI's terms](https://www.ti.com/legal/terms-conditions/terms-of-use.html); BeagleBoard-derived assets retain their upstream terms. The repository license does not relicense board designs. See each immutable source URL and attribution in `source-files.json`.


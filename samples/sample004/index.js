"use strict"
module.exports = {
  ...require("./board.json"),
  connections: require("./connections.json"),
  obstacles: [
    ...require("./obstacles001.json"),
    ...require("./obstacles002.json"),
    ...require("./obstacles003.json"),
    ...require("./obstacles004.json"),
    ...require("./obstacles005.json"),
    ...require("./obstacles006.json"),
    ...require("./obstacles007.json"),
    ...require("./obstacles008.json"),
    ...require("./obstacles009.json"),
    ...require("./obstacles010.json"),
    ...require("./obstacles011.json"),
    ...require("./obstacles012.json"),
    ...require("./obstacles013.json"),
    ...require("./obstacles014.json"),
  ],
}

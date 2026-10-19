"use strict"

exports.sample001 = require("./samples/sample001/index.js")
exports.sample002 = require("./samples/sample002/index.js")
exports.sample003 = require("./samples/sample003/index.js")
exports.sample004 = require("./samples/sample004/index.js")

exports.dataset = {
  sample001: exports.sample001,
  sample002: exports.sample002,
  sample003: exports.sample003,
  sample004: exports.sample004,
}
exports.default = exports.dataset

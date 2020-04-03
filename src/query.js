'use strict'

const protons = require('protons')
const schema = `
message Peer {
  required bytes publicKey = 0;
  repeated bytes addrs = 1;
}
`

module.exports = protons(schema)

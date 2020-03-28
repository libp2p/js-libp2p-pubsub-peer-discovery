'use strict'

const protons = require('protons')
const schema = `
message Query {
  // id is 32 random bytes
  required bytes id = 0;
  required QueryResponse queryResponse = 1;
}

message QueryResponse {
  required bytes queryID = 0;
  required bytes publicKey = 1;
  repeated bytes addrs = 2;
}
`

module.exports = protons(schema)

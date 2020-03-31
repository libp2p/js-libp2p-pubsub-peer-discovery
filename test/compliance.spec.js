/* eslint-env mocha */
'use strict'

const tests = require('libp2p-interfaces/src/peer-discovery/tests')
const PubsubPeerDiscovery = require('../src')

const PeerID = require('peer-id')
const PeerInfo = require('peer-info')

describe('compliance tests', () => {
  tests({
    async setup () {
      const peerId = await PeerID.create({ bits: 512 })
      const peerInfo = new PeerInfo(peerId)
      await new Promise(resolve => setTimeout(resolve, 10))
      return new PubsubPeerDiscovery({
        libp2p: {
          peerInfo,
          pubsub: {
            subscribe: () => {},
            unsubscribe: () => {},
            publish: () => {}
          }
        }
      })
    },
    async teardown () {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  })
})

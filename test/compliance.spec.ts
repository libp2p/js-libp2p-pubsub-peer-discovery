/* eslint-env mocha */
'use strict'

const tests = require('libp2p-interfaces/src/peer-discovery/tests')
const PubsubPeerDiscovery = require('../src')

const PeerID = require('peer-id')

describe('compliance tests', () => {
  let intervalId
  tests({
    async setup () {
      const peerId = await PeerID.create({ bits: 512 })
      await new Promise(resolve => setTimeout(resolve, 10))

      const pubsubDiscovery = new PubsubPeerDiscovery({
        libp2p: {
          multiaddrs: [],
          peerId,
          pubsub: {
            subscribe: () => {},
            unsubscribe: () => {},
            publish: () => {}
          }
        }
      })

      intervalId = setInterval(() => {
        pubsubDiscovery._onNewPeer(peerId, ['/ip4/166.10.1.2/tcp/80'])
      }, 1000)

      return pubsubDiscovery
    },
    async teardown () {
      await new Promise(resolve => setTimeout(resolve, 10))
      clearInterval(intervalId)
    }
  })
})

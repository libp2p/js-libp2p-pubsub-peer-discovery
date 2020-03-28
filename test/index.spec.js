/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const { expect } = chai
const defer = require('p-defer')

const PeerID = require('peer-id')
const PeerInfo = require('peer-info')
const { randomBytes } = require('libp2p-crypto')
const multiaddr = require('multiaddr')

const PubsubPeerDiscovery = require('../src')
const PB = require('../src/query')

describe('Pubsub Peer Discovery', () => {
  let mockLibp2p
  before(async () => {
    const peerInfo = await PeerInfo.create()
    mockLibp2p = {
      peerInfo,
      pubsub: {
        subscribe: () => {},
        publish: () => {},
        unsubscribe: () => {}
      }
    }
  })

  it('should be able to encode/decode a query', async () => {
    const discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
    const id = randomBytes(32)
    const peerId = await PeerID.create({ bits: 512 })
    const expectedPeeerInfo = new PeerInfo(peerId)
    expectedPeeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8080/ws')
    expectedPeeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8081/ws')
    const query = {
      id,
      queryResponse: {
        queryID: id,
        publicKey: peerId.pubKey.bytes,
        addrs: expectedPeeerInfo.multiaddrs.toArray().map(ma => ma.buffer)
      }
    }

    const deferred = defer()
    const encodedQuery = PB.Query.encode(query)
    discovery.on('peer', (p) => {
      deferred.resolve(p)
    })
    await discovery._handleQuery(encodedQuery)

    const discoveredPeer = await deferred.promise
    expect(discoveredPeer.id.equals(expectedPeeerInfo.id)).to.equal(true)
    expectedPeeerInfo.multiaddrs.forEach(addr => {
      expect(discoveredPeer.multiaddrs.has(addr)).to.equal(true)
    })
  })

  it('should be able to encode/decode a response', async () => {
    const id = randomBytes(32)
    const peerId = await PeerID.create({ bits: 512 })
    const queryResponse = {
      queryID: id,
      publicKey: peerId.pubKey.bytes,
      addrs: [multiaddr('/ip4/0.0.0.0/tcp/8082/ws').buffer, multiaddr('/ip4/0.0.0.0/tcp/8083/ws').buffer]
    }

    const encodedResponse = PB.QueryResponse.encode(queryResponse)
    expect(PB.QueryResponse.decode(encodedResponse)).to.eql(queryResponse)
  })
})

/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const { expect } = chai
const sinon = require('sinon')
const defer = require('p-defer')

const PeerID = require('peer-id')
const PeerInfo = require('peer-info')
const { randomBytes } = require('libp2p-crypto')

const PubsubPeerDiscovery = require('../src')
const PB = require('../src/query')

describe('Pubsub Peer Discovery', () => {
  let mockLibp2p
  before(async () => {
    const peerInfo = await PeerInfo.create()
    peerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/9000/ws')

    mockLibp2p = {
      peerInfo,
      pubsub: {
        subscribe: () => {},
        publish: () => {},
        unsubscribe: () => {}
      }
    }
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should not discover self', async () => {
    const discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
    sinon.spy(mockLibp2p.pubsub, 'publish')
    discovery._query()
    expect(mockLibp2p.pubsub.publish.callCount).to.equal(1)

    const [topic, encodedQuery] = mockLibp2p.pubsub.publish.getCall(0).args
    const { queryResponse } = PB.Query.decode(encodedQuery)
    const peerId = await PeerID.createFromPubKey(queryResponse.publicKey)
    expect(peerId.equals(mockLibp2p.peerInfo.id)).to.equal(true)
    expect(queryResponse.addrs).to.have.length(1)
    queryResponse.addrs.forEach((addr) => {
      expect(mockLibp2p.peerInfo.multiaddrs.has(addr)).to.equal(true)
    })
    expect(topic).to.equal(PubsubPeerDiscovery.TOPIC)

    const spy = sinon.spy()
    discovery.on('peer', spy)
    await discovery._handleQuery(encodedQuery)
    expect(spy.callCount).to.equal(0)
  })

  it('should be able to encode/decode a query', async () => {
    const discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
    const id = randomBytes(32)
    const peerId = await PeerID.create({ bits: 512 })
    const expectedPeerInfo = new PeerInfo(peerId)
    expectedPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8080/ws')
    expectedPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8081/ws')
    const query = {
      id,
      queryResponse: {
        queryID: id,
        publicKey: peerId.pubKey.bytes,
        addrs: expectedPeerInfo.multiaddrs.toArray().map(ma => ma.buffer)
      }
    }

    const deferred = defer()
    const encodedQuery = PB.Query.encode(query)
    discovery.on('peer', (p) => {
      deferred.resolve(p)
    })
    await discovery._onMessage({ data: encodedQuery })

    const discoveredPeer = await deferred.promise
    expect(discoveredPeer.id.equals(expectedPeerInfo.id)).to.equal(true)
    expectedPeerInfo.multiaddrs.forEach(addr => {
      expect(discoveredPeer.multiaddrs.has(addr)).to.equal(true)
    })
  })

  it('should be able to encode/decode a response', async () => {
    const discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
    const id = randomBytes(32)
    const peerId = await PeerID.create({ bits: 512 })
    const expectedPeerInfo = new PeerInfo(peerId)
    expectedPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8082/ws')
    expectedPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/8083/ws')

    const queryResponse = {
      queryID: id,
      publicKey: peerId.pubKey.bytes,
      addrs: expectedPeerInfo.multiaddrs.toArray().map(ma => ma.buffer)
    }

    const deferred = defer()
    const encodedResponse = PB.QueryResponse.encode(queryResponse)
    discovery.on('peer', (p) => deferred.resolve(p))

    discovery._onMessage({ data: encodedResponse })
    const discoveredPeer = await deferred.promise

    expect(discoveredPeer.id.equals(expectedPeerInfo.id)).to.equal(true)
    expectedPeerInfo.multiaddrs.forEach(addr => {
      expect(discoveredPeer.multiaddrs.has(addr)).to.equal(true)
    })
  })

  it('should be able to add and remove peer listeners', () => {
    const discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
    const handler = () => {}
    discovery.on('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(1)
    discovery.off('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(0)

    // Verify libp2p usage
    discovery.on('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(1)
    discovery.removeListener('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(0)
  })
})

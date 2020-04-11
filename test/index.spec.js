/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-bytes'))
const { expect } = chai
const sinon = require('sinon')
const defer = require('p-defer')
const pWaitFor = require('p-wait-for')

const multiaddr = require('multiaddr')
const PeerID = require('peer-id')

const PubsubPeerDiscovery = require('../src')
const PB = require('../src/peer.proto')

const listeningMultiaddrs = multiaddr('/ip4/127.0.0.1/tcp/9000/ws')

describe('Pubsub Peer Discovery', () => {
  let mockLibp2p
  let discovery

  before(async () => {
    const peerId = await PeerID.create()

    mockLibp2p = {
      peerId,
      pubsub: {
        subscribe: () => {},
        publish: () => {},
        unsubscribe: () => {}
      }
    }
  })

  afterEach(() => {
    discovery && discovery.stop()
    sinon.restore()
  })

  it('should not discover self', async () => {
    discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p, multiaddrs: [listeningMultiaddrs] })
    sinon.spy(mockLibp2p.pubsub, 'publish')
    discovery._broadcast()
    expect(mockLibp2p.pubsub.publish.callCount).to.equal(1)

    const [topic, encodedPeer] = mockLibp2p.pubsub.publish.getCall(0).args
    const peer = PB.Peer.decode(encodedPeer)
    const peerId = await PeerID.createFromPubKey(peer.publicKey)
    expect(peerId.equals(mockLibp2p.peerId)).to.equal(true)
    expect(peer.addrs).to.have.length(1)
    peer.addrs.forEach((addr) => {
      expect(addr).to.equalBytes(listeningMultiaddrs.buffer)
    })
    expect(topic).to.equal(PubsubPeerDiscovery.TOPIC)

    const spy = sinon.spy()
    discovery.on('peer', spy)
    await discovery._onMessage({ data: encodedPeer })
    expect(spy.callCount).to.equal(0)
  })

  it('should be able to encode/decode a message', async () => {
    discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p, multiaddrs: [listeningMultiaddrs] })
    discovery.start()

    const peerId = await PeerID.create({ bits: 512 })
    const expectedPeerData = {
      id: peerId,
      multiaddrs: [
        '/ip4/0.0.0.0/tcp/8080/ws',
        '/ip4/0.0.0.0/tcp/8081/ws'
      ]
    }
    const peer = {
      publicKey: peerId.pubKey.bytes,
      addrs: expectedPeerData.multiaddrs.map(ma => multiaddr(ma).buffer)
    }

    const deferred = defer()
    const encodedPeer = PB.Peer.encode(peer)
    discovery.on('peer', (p) => {
      deferred.resolve(p)
    })
    sinon.spy(mockLibp2p.pubsub, 'publish')

    await discovery._onMessage({ data: encodedPeer, topicIDs: [PubsubPeerDiscovery.TOPIC] })

    const discoveredPeer = await deferred.promise
    expect(discoveredPeer.id.equals(expectedPeerData.id)).to.equal(true)

    discoveredPeer.multiaddrs.forEach(addr => {
      expect(expectedPeerData.multiaddrs.includes(addr.toString())).to.equal(true)
    })
  })

  it('should not broadcast if only listening', () => {
    discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p, listenOnly: true })

    sinon.spy(mockLibp2p.pubsub, 'publish')
    discovery.start()
    expect(mockLibp2p.pubsub.publish.callCount).to.equal(0)
  })

  it('should broadcast after start and on interval', async () => {
    discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p, interval: 100 })
    sinon.spy(mockLibp2p.pubsub, 'publish')
    await discovery.start()

    await pWaitFor(() => mockLibp2p.pubsub.publish.callCount >= 2)
  })

  it('should be able to add and remove peer listeners', () => {
    discovery = new PubsubPeerDiscovery({ libp2p: mockLibp2p })
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

  it('should allow for customized topics', async () => {
    // Listen to the global topic and the namespace of `myApp`
    const topics = [`myApp.${PubsubPeerDiscovery.TOPIC}`, PubsubPeerDiscovery.TOPIC]
    discovery = new PubsubPeerDiscovery({
      libp2p: mockLibp2p,
      topics
    })
    sinon.spy(mockLibp2p.pubsub, 'subscribe')
    sinon.spy(mockLibp2p.pubsub, 'unsubscribe')

    await discovery.start()
    expect(mockLibp2p.pubsub.subscribe.callCount).to.equal(2)
    topics.forEach((topic, index) => {
      // The first arg of the matching call number should be the matching topic we sent
      expect(mockLibp2p.pubsub.subscribe.args[index][0]).to.equal(topic)
    })

    await discovery.stop()
    expect(mockLibp2p.pubsub.unsubscribe.callCount).to.equal(2)
    topics.forEach((topic, index) => {
      // The first arg of the matching call number should be the matching topic we sent
      expect(mockLibp2p.pubsub.unsubscribe.args[index][0]).to.equal(topic)
    })
  })
})

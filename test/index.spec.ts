/* eslint-env mocha */

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import defer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { Multiaddr } from '@multiformats/multiaddr'
import { PubSubPeerDiscovery, TOPIC } from '../src/index.js'
import * as PB from '../src/peer.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { StubbedInstance, stubInterface } from 'ts-sinon'
import type { PubSub } from '@libp2p/interface-pubsub'
import { Components } from '@libp2p/components'
import { peerIdFromKeys } from '@libp2p/peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import { CustomEvent } from '@libp2p/interfaces/events'
import type { AddressManager } from '@libp2p/interface-address-manager'
import { start, stop } from '@libp2p/interfaces/startable'

const listeningMultiaddr = new Multiaddr('/ip4/127.0.0.1/tcp/9000/ws')

describe('PubSub Peer Discovery', () => {
  let mockPubsub: StubbedInstance<PubSub>
  let discovery: PubSubPeerDiscovery
  let components: Components

  beforeEach(async () => {
    const peerId = await createEd25519PeerId()

    mockPubsub = stubInterface<PubSub>()

    const addressManager = stubInterface<AddressManager>()
    addressManager.getAddresses.returns([
      listeningMultiaddr
    ])

    components = new Components()
    components.setPeerId(peerId)
    components.setPubSub(mockPubsub)
    components.setAddressManager(addressManager)
  })

  afterEach(async () => {
    if (discovery != null) {
      await stop(discovery)
    }

    sinon.restore()
  })

  it('should not discover self', async () => {
    discovery = new PubSubPeerDiscovery()
    discovery.init(components)
    await discovery.start()
    await discovery.afterStart()

    expect(mockPubsub.dispatchEvent.callCount).to.equal(1)
    discovery._broadcast()
    expect(mockPubsub.dispatchEvent.callCount).to.equal(2)

    const event = mockPubsub.dispatchEvent.getCall(0).args[0] as CustomEvent<Uint8Array>

    if (!(event.detail instanceof Uint8Array)) {
      throw new Error('Wrong argument type passed to dispatchEvent')
    }

    const peer = PB.Peer.decode(event.detail)
    const peerId = await peerIdFromKeys(peer.publicKey)
    expect(peerId.equals(components.getPeerId())).to.equal(true)
    expect(peer.addrs).to.have.length(1)
    peer.addrs.forEach((addr) => {
      expect(addr).to.equalBytes(listeningMultiaddr.bytes)
    })

    const spy = sinon.spy()
    discovery.addEventListener('peer', spy)
    await discovery._onMessage(new CustomEvent('message', {
      detail: {
        from: components.getPeerId(),
        topic: TOPIC,
        data: event.detail
      }
    }))
    expect(spy.callCount).to.equal(0)
  })

  it('should be able to encode/decode a message', async () => {
    discovery = new PubSubPeerDiscovery()
    discovery.init(components)
    await start(discovery)

    const peerId = await createEd25519PeerId()
    const expectedPeerData: PeerInfo = {
      id: peerId,
      multiaddrs: [
        new Multiaddr('/ip4/0.0.0.0/tcp/8080/ws'),
        new Multiaddr('/ip4/0.0.0.0/tcp/8081/ws')
      ],
      protocols: []
    }
    const peer = {
      publicKey: peerId.publicKey,
      addrs: expectedPeerData.multiaddrs.map(ma => new Multiaddr(ma).bytes)
    }

    const deferred = defer<PeerInfo>()
    const encodedPeer = PB.Peer.encode(peer)
    discovery.addEventListener('peer', (evt) => {
      deferred.resolve(evt.detail)
    })

    await discovery._onMessage(new CustomEvent('message', {
      detail: {
        from: components.getPeerId(),
        data: encodedPeer,
        topic: TOPIC
      }
    }))

    const discoveredPeer = await deferred.promise
    expect(discoveredPeer.id.equals(expectedPeerData.id)).to.equal(true)

    discoveredPeer.multiaddrs.forEach(addr => {
      expect(expectedPeerData.multiaddrs.map(ma => ma.toString()).includes(addr.toString())).to.equal(true)
    })
  })

  it('should not broadcast if only listening', async () => {
    discovery = new PubSubPeerDiscovery({ listenOnly: true })
    discovery.init(components)
    await start(discovery)

    expect(mockPubsub.dispatchEvent.callCount).to.equal(0)
  })

  it('should broadcast after start and on interval', async () => {
    discovery = new PubSubPeerDiscovery({ interval: 100 })
    discovery.init(components)
    await start(discovery)

    await pWaitFor(() => mockPubsub.dispatchEvent.callCount >= 2)
  })

  it('should be able to add and remove peer listeners', async () => {
    discovery = new PubSubPeerDiscovery()
    discovery.init(components)
    await start(discovery)

    const handler = () => {}
    discovery.addEventListener('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(1)
    discovery.removeEventListener('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(0)

    // Verify libp2p usage
    discovery.addEventListener('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(1)
    discovery.removeEventListener('peer', handler)
    expect(discovery.listenerCount('peer')).to.equal(0)
  })

  it('should allow for customized topics', async () => {
    // Listen to the global topic and the namespace of `myApp`
    const topics = [`myApp.${TOPIC}`, TOPIC]

    discovery = new PubSubPeerDiscovery({
      topics
    })
    discovery.init(components)
    await start(discovery)

    expect(mockPubsub.addEventListener.callCount).to.equal(2)
    topics.forEach((topic, index) => {
      // The first arg of the matching call number should be the matching topic we sent
      expect(mockPubsub.addEventListener.args[index][0]).to.equal('message')
    })

    await stop(discovery)
    expect(mockPubsub.removeEventListener.callCount).to.equal(2)
    topics.forEach((topic, index) => {
      // The first arg of the matching call number should be the matching topic we sent
      expect(mockPubsub.removeEventListener.args[index][0]).to.equal('message')
    })
  })
})

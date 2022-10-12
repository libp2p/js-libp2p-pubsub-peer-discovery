/* eslint-env mocha */

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import defer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { multiaddr } from '@multiformats/multiaddr'
import { pubsubPeerDiscovery, PubSubPeerDiscoveryComponents, TOPIC } from '../src/index.js'
import * as PB from '../src/peer.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { StubbedInstance, stubInterface } from 'ts-sinon'
import type { PubSub } from '@libp2p/interface-pubsub'
import { peerIdFromKeys } from '@libp2p/peer-id'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import { CustomEvent } from '@libp2p/interfaces/events'
import type { AddressManager } from '@libp2p/interface-address-manager'
import { start, stop } from '@libp2p/interfaces/startable'
import type { PeerDiscovery } from '@libp2p/interface-peer-discovery'

const listeningMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/9000/ws')

describe('PubSub Peer Discovery', () => {
  let mockPubsub: StubbedInstance<PubSub>
  let discovery: PeerDiscovery
  let components: PubSubPeerDiscoveryComponents

  beforeEach(async () => {
    const peerId = await createEd25519PeerId()

    mockPubsub = stubInterface<PubSub>()

    const addressManager = stubInterface<AddressManager>()
    addressManager.getAddresses.returns([
      listeningMultiaddr
    ])

    components = {
      peerId,
      pubsub: mockPubsub,
      addressManager
    }
  })

  afterEach(async () => {
    if (discovery != null) {
      await stop(discovery)
    }

    sinon.restore()
  })

  it('should not discover self', async () => {
    discovery = pubsubPeerDiscovery()(components)
    await start(discovery)

    expect(mockPubsub.publish.callCount).to.equal(1)

    // @ts-expect-error private field
    discovery._broadcast()
    expect(mockPubsub.publish.callCount).to.equal(2)

    const eventData = mockPubsub.publish.getCall(0).args[1]

    if (!('byteLength' in eventData)) {
      throw new Error('Wrong argument type passed to dispatchEvent')
    }

    const peer = PB.Peer.decode(eventData)
    const peerId = await peerIdFromKeys(peer.publicKey)
    expect(peerId.equals(components.peerId)).to.equal(true)
    expect(peer.addrs).to.have.length(1)
    peer.addrs.forEach((addr) => {
      expect(addr).to.equalBytes(listeningMultiaddr.bytes)
    })

    const spy = sinon.spy()
    discovery.addEventListener('peer', spy)

    // @ts-expect-error private field
    await discovery._onMessage(new CustomEvent('message', {
      detail: {
        type: 'unsigned',
        topic: TOPIC,
        data: eventData
      }
    }))
    expect(spy.callCount).to.equal(0)
  })

  it('should be able to encode/decode a message', async () => {
    discovery = pubsubPeerDiscovery()(components)
    await start(discovery)

    const peerId = await createEd25519PeerId()
    const expectedPeerData: PeerInfo = {
      id: peerId,
      multiaddrs: [
        multiaddr('/ip4/0.0.0.0/tcp/8080/ws'),
        multiaddr('/ip4/0.0.0.0/tcp/8081/ws')
      ],
      protocols: []
    }
    const peer = {
      publicKey: peerId.publicKey,
      addrs: expectedPeerData.multiaddrs.map(ma => multiaddr(ma).bytes)
    }

    const deferred = defer<PeerInfo>()
    const encodedPeer = PB.Peer.encode(peer).subarray()
    discovery.addEventListener('peer', (evt: CustomEvent<PeerInfo>) => {
      deferred.resolve(evt.detail)
    })

    // @ts-expect-error private field
    await discovery._onMessage(new CustomEvent('message', {
      detail: {
        type: 'unsigned',
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
    discovery = pubsubPeerDiscovery({ listenOnly: true })(components)
    await start(discovery)

    expect(mockPubsub.dispatchEvent.callCount).to.equal(0)
  })

  it('should broadcast after start and on interval', async () => {
    discovery = pubsubPeerDiscovery({ interval: 100 })(components)
    await start(discovery)

    await pWaitFor(() => mockPubsub.publish.callCount >= 2)
  })

  it('should be able to add and remove peer listeners', async () => {
    discovery = pubsubPeerDiscovery()(components)
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

    discovery = pubsubPeerDiscovery({ topics })(components)
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

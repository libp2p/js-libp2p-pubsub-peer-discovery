/* eslint-env mocha */

import { generateKeyPair, publicKeyFromProtobuf, publicKeyToProtobuf } from '@libp2p/crypto/keys'
import { start, stop } from '@libp2p/interface'
import { defaultLogger } from '@libp2p/logger'
import { peerIdFromPrivateKey, peerIdFromPublicKey } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import defer from 'p-defer'
import pWaitFor from 'p-wait-for'
import sinon from 'sinon'
import { stubInterface } from 'sinon-ts'
import { pubsubPeerDiscovery, TOPIC } from '../src/index.js'
import * as PB from '../src/peer.js'
import type { PubSubPeerDiscoveryComponents } from '../src/index.js'
import type { PeerDiscovery, PeerInfo, PubSub } from '@libp2p/interface'
import type { AddressManager } from '@libp2p/interface-internal'
import type { StubbedInstance } from 'sinon-ts'

const listeningMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/9000/ws')

describe('PubSub Peer Discovery', () => {
  let mockPubsub: StubbedInstance<PubSub>
  let discovery: PeerDiscovery
  let components: PubSubPeerDiscoveryComponents

  beforeEach(async () => {
    const privateKey = await generateKeyPair('Ed25519')
    const peerId = peerIdFromPrivateKey(privateKey)

    const subscriberPrivateKey = await generateKeyPair('Ed25519')
    const subscriber = peerIdFromPrivateKey(subscriberPrivateKey)

    mockPubsub = stubInterface<PubSub>({
      getSubscribers: () => {
        return [
          subscriber
        ]
      }
    })

    const addressManager = stubInterface<AddressManager>()
    addressManager.getAddresses.returns([
      listeningMultiaddr
    ])

    components = {
      peerId,
      pubsub: mockPubsub,
      addressManager,
      logger: defaultLogger()
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
    const peerId = peerIdFromPublicKey(publicKeyFromProtobuf(peer.publicKey))
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

    const privateKey = await generateKeyPair('Ed25519')
    const peerId = peerIdFromPrivateKey(privateKey)
    const expectedPeerData: PeerInfo = {
      id: peerId,
      multiaddrs: [
        multiaddr('/ip4/0.0.0.0/tcp/8080/ws'),
        multiaddr('/ip4/0.0.0.0/tcp/8081/ws')
      ]
    }
    const peer = {
      publicKey: publicKeyToProtobuf(peerId.publicKey),
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

    const handler = (): void => {}
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

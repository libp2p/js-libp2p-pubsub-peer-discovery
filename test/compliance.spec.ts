/* eslint-env mocha */

import tests from '@libp2p/interface-compliance-tests/peer-discovery'
import { PubSubPeerDiscovery, TOPIC } from '../src/index.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { Components } from '@libp2p/interfaces/components'
import { stubInterface } from 'ts-sinon'
import type { PubSub } from '@libp2p/interfaces/pubsub'
import { AddressManager, CustomEvent } from '@libp2p/interfaces'
import { Multiaddr } from '@multiformats/multiaddr'
import { Peer as PBPeer } from '../src/peer.js'

describe('compliance tests', () => {
  let intervalId: ReturnType<typeof setInterval>

  tests({
    async setup () {
      const peerId = await createEd25519PeerId()
      await new Promise(resolve => setTimeout(resolve, 10))

      const addressManager = stubInterface<AddressManager>()
      addressManager.getAddresses.returns([
        new Multiaddr(`/ip4/43.10.1.2/tcp/39832/p2p/${peerId.toString()}`)
      ])

      const pubsubDiscovery = new PubSubPeerDiscovery()

      const components = new Components()
      components.setPubSub(stubInterface<PubSub>())
      components.setPeerId(await createEd25519PeerId())
      components.setAddressManager(addressManager)

      pubsubDiscovery.init(components)

      intervalId = setInterval(() => {
        const peer = PBPeer.encode({
          publicKey: peerId.publicKey,
          addrs: [
            new Multiaddr('/ip4/166.10.1.2/tcp/80').bytes
          ]
        }).finish()

        pubsubDiscovery._onMessage(new CustomEvent(TOPIC, {
          detail: {
            from: peerId,
            topic: TOPIC,
            data: peer
          }
        }))
      }, 1000)

      return pubsubDiscovery
    },
    async teardown () {
      await new Promise(resolve => setTimeout(resolve, 10))
      clearInterval(intervalId)
    }
  })
})

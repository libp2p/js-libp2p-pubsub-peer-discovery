/* eslint-env mocha */

import tests from '@libp2p/interface-peer-discovery-compliance-tests'
import { pubsubPeerDiscovery, TOPIC } from '../src/index.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { stubInterface } from 'ts-sinon'
import type { PubSub } from '@libp2p/interface-pubsub'
import { CustomEvent } from '@libp2p/interfaces/events'
import type { AddressManager } from '@libp2p/interface-address-manager'
import { multiaddr } from '@multiformats/multiaddr'
import { Peer as PBPeer } from '../src/peer.js'

describe('compliance tests', () => {
  let intervalId: ReturnType<typeof setInterval>

  tests({
    async setup () {
      const peerId = await createEd25519PeerId()
      await new Promise(resolve => setTimeout(resolve, 10))

      const addressManager = stubInterface<AddressManager>()
      addressManager.getAddresses.returns([
        multiaddr(`/ip4/43.10.1.2/tcp/39832/p2p/${peerId.toString()}`)
      ])

      const pubsubDiscovery = pubsubPeerDiscovery()({
        pubsub: stubInterface<PubSub>(),
        peerId: await createEd25519PeerId(),
        addressManager
      })

      intervalId = setInterval(() => {
        const peer = PBPeer.encode({
          publicKey: peerId.publicKey,
          addrs: [
            multiaddr('/ip4/166.10.1.2/tcp/80').bytes
          ]
        }).subarray()

        // @ts-expect-error private field
        pubsubDiscovery._onMessage(new CustomEvent('message', {
          detail: {
            type: 'unsigned',
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

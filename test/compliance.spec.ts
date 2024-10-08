/* eslint-env mocha */

import { generateKeyPair, publicKeyToProtobuf } from '@libp2p/crypto/keys'
import tests from '@libp2p/interface-compliance-tests/peer-discovery'
import { defaultLogger } from '@libp2p/logger'
import { peerIdFromPrivateKey } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import { stubInterface } from 'sinon-ts'
import { pubsubPeerDiscovery, TOPIC } from '../src/index.js'
import { Peer as PBPeer } from '../src/peer.js'
import type { PubSub } from '@libp2p/interface'
import type { AddressManager } from '@libp2p/interface-internal'

describe('compliance tests', () => {
  let intervalId: ReturnType<typeof setInterval>

  tests({
    async setup () {
      const privateKey = await generateKeyPair('Ed25519')
      const peerId = peerIdFromPrivateKey(privateKey)

      const subscriberPrivateKey = await generateKeyPair('Ed25519')
      const subscriber = peerIdFromPrivateKey(subscriberPrivateKey)

      const addressManager = stubInterface<AddressManager>()
      addressManager.getAddresses.returns([
        multiaddr(`/ip4/43.10.1.2/tcp/39832/p2p/${peerId.toString()}`)
      ])

      const pubsubDiscovery = pubsubPeerDiscovery()({
        pubsub: stubInterface<PubSub>({
          getSubscribers: () => {
            return [
              subscriber
            ]
          }
        }),
        peerId,
        addressManager,
        logger: defaultLogger()
      })

      intervalId = setInterval(() => {
        const peer = PBPeer.encode({
          publicKey: publicKeyToProtobuf(subscriber.publicKey),
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

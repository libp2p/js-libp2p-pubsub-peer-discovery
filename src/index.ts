import { logger } from '@libp2p/logger'
import { CustomEvent, EventEmitter } from '@libp2p/interfaces/events'
import type { Startable } from '@libp2p/interfaces/startable'
import { Multiaddr } from '@multiformats/multiaddr'
import { Peer as PBPeer } from './peer.js'
import { peerIdFromKeys } from '@libp2p/peer-id'
import type { PeerDiscovery, PeerDiscoveryEvents } from '@libp2p/interface-peer-discovery'
import { Components, Initializable } from '@libp2p/components'
import type { Message } from '@libp2p/interface-pubsub'
import type { PeerInfo } from '@libp2p/interface-peer-info'
import { symbol } from '@libp2p/interface-peer-discovery'

const log = logger('libp2p:discovery:pubsub')
export const TOPIC = '_peer-discovery._p2p._pubsub'

export interface PubsubPeerDiscoveryInit {
  /**
   * How often (ms) we should broadcast our infos
   */
  interval?: number

  /**
   * What topics to subscribe to. If set, the default will NOT be used.
   */
  topics?: string[]

  /**
   * If true, we will not broadcast our peer data
   */
  listenOnly?: boolean
}

/**
 * A Peer Discovery Service that leverages libp2p Pubsub to find peers.
 */
export class PubSubPeerDiscovery extends EventEmitter<PeerDiscoveryEvents> implements PeerDiscovery, Startable, Initializable {
  private readonly interval: number
  private readonly listenOnly: boolean
  private readonly topics: string[]
  private intervalId?: ReturnType<typeof setInterval>
  private components: Components = new Components()

  constructor (init: PubsubPeerDiscoveryInit = {}) {
    super()

    const {
      interval,
      topics,
      listenOnly
    } = init

    this.interval = interval ?? 10000
    this.listenOnly = listenOnly ?? false

    // Ensure we have topics
    if (Array.isArray(topics) && topics.length > 0) {
      this.topics = topics
    } else {
      this.topics = [TOPIC]
    }

    this._onMessage = this._onMessage.bind(this)
  }

  get [symbol] (): true {
    return true
  }

  get [Symbol.toStringTag] () {
    return '@libp2p/pubsub-peer-discovery'
  }

  init (components: Components) {
    this.components = components
  }

  isStarted () {
    return this.intervalId != null
  }

  start () {

  }

  /**
   * Subscribes to the discovery topic on `libp2p.pubsub` and performs a broadcast
   * immediately, and every `this.interval`
   */
  afterStart () {
    if (this.intervalId != null) {
      return
    }

    const pubsub = this.components.getPubSub()

    if (pubsub == null) {
      throw new Error('PubSub not configured')
    }

    // Subscribe to pubsub
    for (const topic of this.topics) {
      pubsub.subscribe(topic)
      pubsub.addEventListener('message', this._onMessage)
    }

    // Don't broadcast if we are only listening
    if (this.listenOnly) {
      return
    }

    // Broadcast immediately, and then run on interval
    this._broadcast()

    // Periodically publish our own information
    this.intervalId = setInterval(() => {
      this._broadcast()
    }, this.interval)
  }

  beforeStop () {
    const pubsub = this.components.getPubSub()

    if (pubsub == null) {
      throw new Error('PubSub not configured')
    }

    for (const topic of this.topics) {
      pubsub.unsubscribe(topic)
      pubsub.removeEventListener('message', this._onMessage)
    }
  }

  /**
   * Unsubscribes from the discovery topic
   */
  stop () {
    if (this.intervalId != null) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  /**
   * Performs a broadcast via Pubsub publish
   */
  _broadcast () {
    const peerId = this.components.getPeerId()

    if (peerId.publicKey == null) {
      throw new Error('PeerId was missing public key')
    }

    const peer = {
      publicKey: peerId.publicKey,
      addrs: this.components.getAddressManager().getAddresses().map(ma => ma.bytes)
    }

    const encodedPeer = PBPeer.encode(peer)
    const pubsub = this.components.getPubSub()

    if (pubsub == null) {
      throw new Error('PubSub not configured')
    }

    for (const topic of this.topics) {
      log('broadcasting our peer data on topic %s', topic)
      void pubsub.publish(topic, encodedPeer)
    }
  }

  /**
   * Handles incoming pubsub messages for our discovery topic
   */
  _onMessage (event: CustomEvent<Message>) {
    if (!this.isStarted()) {
      return
    }

    const message = event.detail

    if (!this.topics.includes(message.topic)) {
      return
    }

    const peer = PBPeer.decode(message.data)

    void peerIdFromKeys(peer.publicKey).then(peerId => {
      // Ignore if we received our own response
      if (peerId.equals(this.components.getPeerId())) {
        return
      }

      log('discovered peer %p on %s', peerId, message.topic)

      this.dispatchEvent(new CustomEvent<PeerInfo>('peer', {
        detail: {
          id: peerId,
          multiaddrs: peer.addrs.map(b => new Multiaddr(b)),
          protocols: []
        }
      }))
    }).catch(err => {
      log.error(err)
    })
  }
}

'use strict'

const Emittery = require('emittery')
const debug = require('debug')

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')

const PB = require('./query')

const log = debug('libp2p:discovery:pubsub')
log.error = debug('libp2p:discovery:pubsub:error')
const TOPIC = '_peer-discovery._p2p._pubsub'

/**
 * @typedef Message
 * @property {string} from
 * @property {Buffer} data
 * @property {Buffer} seqno
 * @property {Array<string>} topicIDs
 * @property {Buffer} signature
 * @property {key} Buffer
 */

/**
  * A Peer Discovery Service that leverages libp2p Pubsub to find peers.
  */
class PubsubPeerDiscovery extends Emittery {
  /**
   * @constructor
   * @param {Libp2p} param0.libp2p Our libp2p node
   * @param {number} [param0.interval] How often (ms) we should broadcast our info. Default: 5000ms
   * @param {Array<string>} [param0.topics] What topics to subscribe to. If set, the default will NOT be used. Default: PubsubPeerDiscovery.TOPIC
   * @param {boolean} [param0.listenOnly] If true, we will not Query nor respond to them. Default: false
   */
  constructor ({
    libp2p,
    interval = 5000,
    topics,
    listenOnly = false
  }) {
    super()
    this.libp2p = libp2p
    this.interval = interval
    this._intervalId = null
    this._listenOnly = listenOnly

    if (topics && topics.length > 0) {
      this.topics = topics
    } else {
      this.topics = [TOPIC]
    }
    this.removeListener = this.off.bind(this)
  }

  /**
   * Subscribes to the discovery topic on `libp2p.pubsub` and peforms a query
   * after `this.delay` milliseconds
   */
  start () {
    if (this._intervalId) return

    // Subscribe to pubsub
    for (const topic of this.topics) {
      this.libp2p.pubsub.subscribe(topic, (msg) => this._onMessage(msg))
    }

    // Don't query if we are only listening
    if (this._listenOnly) return

    // Broadcast immediately, and then run on interval
    this._broadcast()

    // Perform a delayed publish to give pubsub time to do its thing
    this._intervalId = setInterval(() => {
      this._broadcast()
    }, this.interval)
  }

  /**
   * Unsubscribes from the discovery topic
   */
  stop () {
    clearInterval(this._intervalId)
    this._intervalId = null
    for (const topic of this.topics) {
      this.libp2p.pubsub.unsubscribe(topic)
    }
  }

  /**
   * Performs a broadcast via Pubsub publish
   * @private
   */
  _broadcast () {
    const peer = {
      publicKey: this.libp2p.peerInfo.id.pubKey.bytes,
      addrs: this.libp2p.peerInfo.multiaddrs.toArray().map(ma => ma.buffer)
    }

    const encodedPeer = PB.Peer.encode(peer)
    for (const topic of this.topics) {
      log('broadcasting our peer data on topic %s', topic)
      this.libp2p.pubsub.publish(topic, encodedPeer)
    }
  }

  /**
   * Handles incoming pubsub messages for our discovery topic
   * @private
   * @async
   * @param {Message} message A pubsub message
   */
  async _onMessage (message) {
    try {
      const peer = PB.Peer.decode(message.data)
      const peerId = await PeerId.createFromPubKey(peer.publicKey)

      // Ignore if we received our own response
      if (peerId.equals(this.libp2p.peerInfo.id)) return

      const peerInfo = new PeerInfo(peerId)
      peer.addrs.forEach(buffer => peerInfo.multiaddrs.add(multiaddr(buffer)))
      this.emit('peer', peerInfo)
    } catch (err) {
      log.error(err)
    }
  }
}

PubsubPeerDiscovery.TOPIC = TOPIC
PubsubPeerDiscovery.tag = 'PubsubPeerDiscovery'

module.exports = PubsubPeerDiscovery

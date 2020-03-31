'use strict'

const Emittery = require('emittery')
const debug = require('debug')

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const randomBytes = require('libp2p-crypto/src/random-bytes')
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
   *
   * @param {Libp2p} param0.libp2p Our libp2p node
   * @param {Number} [param0.delay] How long to wait (ms) after startup before publishing our Query. Default: 1000ms
   */
  constructor ({ libp2p, delay = 1000 }) {
    super()
    this.libp2p = libp2p
    this.delay = delay
    this._timeout = null
    this.removeListener = this.off.bind(this)
  }

  /**
   * Subscribes to the discovery topic on `libp2p.pubsub` and peforms a query
   * after `this.delay` milliseconds
   */
  start () {
    if (this._timeout) return

    // Subscribe to pubsub
    this.libp2p.pubsub.subscribe(TOPIC, (msg) => this._onMessage(msg))
    // Perform a delayed publish to give pubsub time to do its thing
    this._timeout = setTimeout(() => {
      this._query()
    }, this.delay)
  }

  /**
   * Unsubscribes from the discovery topic
   */
  stop () {
    clearTimeout(this._timeout)
    this._timeout = null
    this.libp2p.pubsub.unsubscribe(TOPIC)
  }

  /**
   * Performs a Query via Pubsub publish
   * @private
   */
  _query () {
    const id = randomBytes(32)
    const query = {
      id,
      queryResponse: {
        queryID: id,
        publicKey: this.libp2p.peerInfo.id.pubKey.bytes,
        addrs: this.libp2p.peerInfo.multiaddrs.toArray().map(ma => ma.buffer)
      }
    }
    const encodedQuery = PB.Query.encode(query)
    this.libp2p.pubsub.publish(TOPIC, encodedQuery)
  }

  /**
   * Handles incoming pubsub messages for our discovery topic
   * @private
   * @async
   * @param {Message} message
   */
  async _onMessage (message) {
    if (await this._handleQuery(message.data)) return

    this._handleQueryResponse(message.data)
  }

  /**
   * Attempts to decode a QueryResponse from the given data. Any errors will be logged and ignored.
   * @private
   * @async
   * @param {Buffer} data The Pubsub message data to decode
   */
  async _handleQuery (data) {
    try {
      const query = PB.Query.decode(data)
      const peerId = await PeerId.createFromPubKey(query.queryResponse.publicKey)
      // Ignore if we received our own response
      if (peerId.equals(this.libp2p.peerInfo.id)) return
      const peerInfo = new PeerInfo(peerId)
      query.queryResponse.addrs.forEach(buffer => peerInfo.multiaddrs.add(multiaddr(buffer)))
      this.emit('peer', peerInfo)
      log('discovered peer', peerInfo.id)
      return true
    } catch (err) {
      log.error(err)
      return false
    }
  }

  /**
   * Attempts to decode a QueryResponse from the given data. Any errors will be logged and ignored.
   * @private
   * @async
   * @param {Buffer} data The Pubsub message data to decode
   */
  async _handleQueryResponse (data) {
    try {
      const queryResponse = PB.QueryResponse.decode(data)
      const peerId = await PeerId.createFromPubKey(queryResponse.publicKey)
      const peerInfo = new PeerInfo(peerId)
      queryResponse.addrs.forEach(buffer => peerInfo.multiaddrs.add(multiaddr(buffer)))
      this.emit('peer', peerInfo)
      log('discovered peer', peerInfo.id)
    } catch (err) {
      log.error(err)
    }
  }
}

module.exports = PubsubPeerDiscovery
module.exports.TOPIC = TOPIC
module.exports.tag = 'PubsubPeerDiscovery'

# js-libp2p Pubsub Peer Discovery

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)

> A js-libp2p module that uses pubsub for mdns like peer discovery

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun).

## Design

This module takes a similar approach to [MulticastDNS (MDNS)](https://github.com/libp2p/specs/blob/master/discovery/mdns.md) queries, except it leverages pubsub to "query" peers on the pubsub topic. A `Query` is performed by publishing a unique Query ID, along with your peers information (Peer ID, PublicKey, Multiaddrs). Each peer that receives the Query will submit a `QueryResponse`, consisting of their peer information and the Query ID being responded to.

### Flow
- When the discovery module is started by libp2p it subscribes to the discovery pubsub topic
- Once subscribed, the peer will "query" the network by publishing a `Query`
- The `Query` will also include your peers `QueryResponse`, so that other nodes can learn about you without needing to poll
- Whenever another pubsub discovery peer joins the pubsub mesh, it will post its `Query`

### Security Considerations
It is worth noting that this module does not include any message signing for queries. The reason for this is that libp2p-pubsub supports message signing and enables it by default, which means the message you received has been verified to be from the originator, so we can trust that the peer information we have received is indeed from the peer who owns it. This doesn't mean the peer can't falsify its own records, but this module isn't currently concerned with that scenario.

## Usage

### Requirements

This module *MUST* be used on a libp2p node that is running [Pubsub](https://github.com/libp2p/js-libp2p-pubsub). If Pubsub does not exist, or is not running, this module will not work.

### Usage in js-libp2p

See the [js-libp2p configuration docs](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#customizing-peer-discovery) for how to include this module as a peer discovery module in js-libp2p.

If you are only interested in listening to the global pubsub topic the minimal configuration for using this with libp2p is:
```js
const Libp2p = require('libp2p')
const Websockets = require('libp2p-websockets')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const GossipSub = require('libp2p-gossipsub')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')

const node = await Libp2p.create({
  modules: {
    transport: [Websockets], // Any libp2p transport(s) can be used
    streamMuxer: [MPLEX],
    connEncryption: [SECIO],
    pubsub: GossipSub, // Can also be `libp2p-floodsub` if desired
    peerDiscovery: [PubsubPeerDiscovery]
  }
})
```

### Customizing Pubsub Peer Discovery

There are a few options you can use to customize `Pubsub Peer Discovery`. You can see the detailed [options](#options) below.

```js
// ... Other imports from above
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')

// Custom topics
const topics = [
  `myApp.${PubsubPeerDiscovery.TOPIC}`, // It's recommended but not required to extend the global space
  PubsubPeerDiscovery.TOPIC // Include if you want to participate in the global space
]

const node = await Libp2p.create({
  modules: { /* See 'Usage in js-libp2p' for this block */ },
  config: {
    peerDiscovery: {
      [PubsubPeerDiscovery.tag]: {
        delay: 1000, // defaults to 1000ms
        topics: topics, // defaults to [PubsubPeerDiscovery.TOPIC]
        listenOnly: false // default to false
      }
    }
  }
})
```


#### Options

| Name | Type | Description |
|------|------|-------------|
| delay | `number` | How long (in `ms`) after subscribing your node should wait before querying. Default (`1000ms`)|
| topics | `Array<string>` | An Array of topic strings. If set, the default topic will not be used and must be included explicitly here |
| listenOnly | `boolean` | If true it will not query or respond to queries. Dont set this unless you have a specific reason to. Default (`false`) |

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT - Protocol Labs 2020
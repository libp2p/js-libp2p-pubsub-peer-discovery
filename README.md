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

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT - Protocol Labs 2020
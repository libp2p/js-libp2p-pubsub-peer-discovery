# @libp2p/pubsub-peer-discovery <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![IRC](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-pubsub-peer-discovery.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-pubsub-peer-discovery)
[![CI](https://img.shields.io/github/workflow/status/libp2p/js-libp2p-interfaces/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/actions/workflows/js-test-and-release.yml)

> A libp2p module that uses pubsub for mdns like peer discovery

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Design](#design)
  - [Flow](#flow)
  - [Security Considerations](#security-considerations)
- [Usage](#usage)
  - [Requirements](#requirements)
  - [Usage in js-libp2p](#usage-in-js-libp2p)
  - [Customizing Pubsub Peer Discovery](#customizing-pubsub-peer-discovery)
    - [Options](#options)
    - [Default Topic](#default-topic)
- [Contribute](#contribute)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i @libp2p/pubsub-peer-discovery
```

## Design

### Flow

- When the discovery module is started by libp2p it subscribes to the discovery pubsub topic(s)
- It will immediately broadcast your peer data via pubsub and repeat the broadcast on the configured `interval`

### Security Considerations

It is worth noting that this module does not include any message signing for broadcasts. The reason for this is that libp2p-pubsub supports message signing and enables it by default, which means the message you received has been verified to be from the originator, so we can trust that the peer information we have received is indeed from the peer who owns it. This doesn't mean the peer can't falsify its own records, but this module isn't currently concerned with that scenario.

## Usage

### Requirements

This module *MUST* be used on a libp2p node that is running [Pubsub](https://github.com/libp2p/js-libp2p-pubsub). If Pubsub does not exist, or is not running, this module will not work.

### Usage in js-libp2p

See the [js-libp2p configuration docs](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#customizing-peer-discovery) for how to include this module as a peer discovery module in js-libp2p.

If you are only interested in listening to the global pubsub topic the minimal configuration for using this with libp2p is:

```js
import { createLibp2p } from 'libp2p'
import { Websockets } from '@libp2p/websockets'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@libp2p/noise'
import GossipSub from 'libp2p-gossipsub'
import { PubSubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'

const node = await createLibp2p({
  transports: [
    new Websockets()
  ], // Any libp2p transport(s) can be used
  streamMuxers: [
    new Mplex()
  ],
  connectionEncryption: [
    new Noise()
  ],
  pubsub: new GossipSub(), // Can also be `libp2p-floodsub` if desired
  peerDiscovery: [
    new PubSubPeerDiscovery()
  ]
})
```

### Customizing Pubsub Peer Discovery

There are a few options you can use to customize `Pubsub Peer Discovery`. You can see the detailed [options](#options) below.

```js
// ... Other imports from above
import PubSubPeerDiscovery from '@libp2p/pubsub-peer-discovery'

// Custom topics
const topics = [
  `myApp._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
  '_peer-discovery._p2p._pubsub' // Include if you want to participate in the global space
]

const node = await createLibp2p({
  // ...
  peerDiscovery: [
    new PubSubPeerDiscovery({
      interval: 10000,
      topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
      listenOnly: false
    })
  ]
})
```

#### Options

| Name       | Type            | Description                                                                                                    |
| ---------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| interval   | `number`        | How often (in `ms`), after initial broadcast, your node should broadcast your peer data. Default (`10000ms`)   |
| topics     | `Array<string>` | An Array of topic strings. If set, the default topic will not be used and must be included explicitly here     |
| listenOnly | `boolean`       | If true it will not broadcast peer data. Dont set this unless you have a specific reason to. Default (`false`) |

#### Default Topic

The default pubsub topic the module subscribes to is `_peer-discovery._p2p._pubsub`, which is also set on `PubsubPeerDiscovery.TOPIC`.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

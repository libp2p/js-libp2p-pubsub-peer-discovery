# @libp2p/pubsub-peer-discovery <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-pubsub-peer-discovery.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-pubsub-peer-discovery)
[![CI](https://img.shields.io/github/actions/workflow/status/libp2p/js-libp2p-pubsub-peer-discovery/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> A libp2p module that uses pubsub for mdns like peer discovery

## Table of contents <!-- omit in toc -->

- [Install](#install)
  - [Browser `<script>` tag](#browser-script-tag)
- [Design](#design)
  - [Flow](#flow)
  - [Security Considerations](#security-considerations)
- [Usage](#usage)
  - [Requirements](#requirements)
  - [Usage in js-libp2p](#usage-in-js-libp2p)
  - [Customizing Pubsub Peer Discovery](#customizing-pubsub-peer-discovery)
    - [Options](#options)
    - [Default Topic](#default-topic)
- [API Docs](#api-docs)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i @libp2p/pubsub-peer-discovery
```

### Browser `<script>` tag

Loading this module through a script tag will make it's exports available as `Libp2pPubsubPeerDiscovery` in the global namespace.

```html
<script src="https://unpkg.com/@libp2p/pubsub-peer-discovery/dist/index.min.js"></script>
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

To run a PubSub service, include a `pubsub` implementation in your services map such as `@chainsafe/libp2p-gossipsub`.

For more information see the [docs on customizing libp2p](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#customizing-libp2p).

### Usage in js-libp2p

See the [js-libp2p configuration docs](https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#customizing-peer-discovery) for how to include this module as a peer discovery module in js-libp2p.

If you are only interested in listening to the global pubsub topic the minimal configuration for using this with libp2p is:

```js
import { createLibp2p } from 'libp2p'
import { websockets } from '@libp2p/websockets'
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { identify } from 'libp2p/identify'

const node = await createLibp2p({
  transports: [
    websockets()
  ], // Any libp2p transport(s) can be used
  streamMuxers: [
    mplex()
  ],
  connectionEncryption: [
    yamux()
  ],
  peerDiscovery: [
    pubsubPeerDiscovery()
  ],
  services: {
    pubsub: gossipsub(),
    identify: identify()
  }
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
    pubsubPeerDiscovery({
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

## API Docs

- <https://libp2p.github.io/js-libp2p-pubsub-peer-discovery>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

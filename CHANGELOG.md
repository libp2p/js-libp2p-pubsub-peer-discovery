### [5.0.3](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v5.0.2...v5.0.3) (2022-05-06)


### Bug Fixes

* update interfaces ([#21](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/21)) ([580f1c2](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/580f1c2324b9fc9065a1acc04b869d12a7bd3c96))

### [5.0.2](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v5.0.1...v5.0.2) (2022-05-04)


### Bug Fixes

* update interfaces and aegir ([#20](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/20)) ([d049d99](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/d049d99d9b1db23e2ddb7cce6bc527e0e107a4ea))

### [5.0.1](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v5.0.0...v5.0.1) (2022-03-22)


### Bug Fixes

* do pubsub operations after start ([#13](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/13)) ([ae53cc9](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/ae53cc9a2c129a9958833a074962f6c94b749b02))

## [5.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v4.0.0...v5.0.0) (2022-03-21)


### ⚠ BREAKING CHANGES

* this module now only has named exports and is ESM only

### Features

* convert to typescript ([#12](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/12)) ([bb13b35](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/bb13b357310fe3e01768c6b5ff0f455145534d9b))

# [4.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v2.0.0...v4.0.0) (2021-05-26)


### Bug Fixes

* add support for multiaddrs 8.0.0 ([#8](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/8)) ([af65502](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/af65502aa08434e0147c5da3a1645a37ed6cd84b))


### chore

* update dependencies and use protobufjs ([#10](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/10)) ([7e3f6b3](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/7e3f6b3647f0496d0278864b8c94b2537defb8c1))


### BREAKING CHANGES

* uses new multiaddr
* emitted peer multiaddrs changed to Uint8Arrays



<a name="3.0.0"></a>
# [3.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v2.0.1...v3.0.0) (2020-10-07)


### Bug Fixes

* add support for multiaddrs 8.0.0 ([#8](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/8)) ([af65502](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/af65502))


### BREAKING CHANGES

* emitted peer multiaddrs changed to Uint8Arrays



<a name="2.0.1"></a>
## [2.0.1](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v2.0.0...v2.0.1) (2020-04-29)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v1.0.0...v2.0.0) (2020-04-21)


### Chores

* peer-discovery not using peer-info ([#5](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/5)) ([ca0bdff](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/ca0bdff))


### BREAKING CHANGES

* peer event emits an object with id and multiaddr instead of a peer-info

* chore: address review



<a name="1.0.0"></a>
# 1.0.0 (2020-04-08)


### Features

* initial implementation ([#1](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/1)) ([d6f7a31](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/d6f7a31))

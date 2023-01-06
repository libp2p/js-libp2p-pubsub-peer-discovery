## [8.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v7.0.1...v8.0.0) (2023-01-06)


### ⚠ BREAKING CHANGES

* update multiformats to v11 (#70)

### Bug Fixes

* update multiformats to v11 ([#70](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/70)) ([c157953](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/c157953b50d926d7ac1cd8c49a95f9507713d8be))

## [7.0.1](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v7.0.0...v7.0.1) (2022-12-16)


### Bug Fixes

* libp2p components type ([#65](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/65)) ([169ec0f](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/169ec0f23e74dcd64ecbad0fc335994db61f484e)), closes [#62](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/62)


### Documentation

* publish api docs ([#69](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/69)) ([dd10a1e](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/dd10a1eced365fd4325f5be3ee5660fca36b31a9))

## [7.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v6.0.2...v7.0.0) (2022-10-12)


### ⚠ BREAKING CHANGES

* modules no longer implement `Initializable` instead switching to constructor injection

### Bug Fixes

* remove @libp2p/components ([#60](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/60)) ([35336fb](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/35336fb409592f2d5a96b5b2864ba8d27d80b0b7)), closes [libp2p/js-libp2p-components#6](https://github.com/libp2p/js-libp2p-components/issues/6)


### Trivial Changes

* Update .github/workflows/stale.yml [skip ci] ([0072812](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/0072812dd5a10bac6433c875a5d44082e82408f6))

## [6.0.2](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v6.0.1...v6.0.2) (2022-08-31)


### Bug Fixes

* peers were not published on pubsub, updated dependencies ([#49](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/49)) ([a4b9a69](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/a4b9a699dc4920f3b2b0475e24ae2fc4d4db6a40))

## [6.0.1](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v6.0.0...v6.0.1) (2022-08-03)


### Trivial Changes

* update project config ([#42](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/42)) ([123099c](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/123099c289cecd21003bcea88c6d91c8499551d4))


### Dependencies

* update deps for no-copy operations ([#43](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/43)) ([90f4d38](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/90f4d38667f426c928a94f3ed08e86546c79452c))

## [6.0.0](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v5.0.4...v6.0.0) (2022-06-15)


### ⚠ BREAKING CHANGES

* uses new single-issue libp2p interface modules

### Features

* update libp2p interfaces ([#32](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/32)) ([b60a381](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/b60a381dc288cf23d98a2718937402263f51dcac))

### [5.0.4](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/compare/v5.0.3...v5.0.4) (2022-05-23)


### Bug Fixes

* update deps ([#26](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/issues/26)) ([d0bd778](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery/commit/d0bd77838cac27c2b3160cfd031f2f8288820ca4))

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

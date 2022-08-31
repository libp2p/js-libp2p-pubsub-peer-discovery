/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */

import { encodeMessage, decodeMessage, message } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'
import type { Codec } from 'protons-runtime'

export interface Peer {
  publicKey: Uint8Array
  addrs: Uint8Array[]
}

export namespace Peer {
  let _codec: Codec<Peer>

  export const codec = (): Codec<Peer> => {
    if (_codec == null) {
      _codec = message<Peer>((obj, writer, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          writer.fork()
        }

        if (obj.publicKey != null) {
          writer.uint32(2)
          writer.bytes(obj.publicKey)
        } else {
          throw new Error('Protocol error: required field "publicKey" was not found in object')
        }

        if (obj.addrs != null) {
          for (const value of obj.addrs) {
            writer.uint32(10)
            writer.bytes(value)
          }
        } else {
          throw new Error('Protocol error: required field "addrs" was not found in object')
        }

        if (opts.lengthDelimited !== false) {
          writer.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {
          publicKey: new Uint8Array(0),
          addrs: []
        }

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 0:
              obj.publicKey = reader.bytes()
              break
            case 1:
              obj.addrs.push(reader.bytes())
              break
            default:
              reader.skipType(tag & 7)
              break
          }
        }

        if (obj.publicKey == null) {
          throw new Error('Protocol error: value for required field "publicKey" was not found in protobuf')
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: Peer): Uint8Array => {
    return encodeMessage(obj, Peer.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): Peer => {
    return decodeMessage(buf, Peer.codec())
  }
}

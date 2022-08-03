/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */

import { encodeMessage, decodeMessage, message, bytes } from 'protons-runtime'
import type { Codec } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface Peer {
  publicKey: Uint8Array
  addrs: Uint8Array[]
}

export namespace Peer {
  export const codec = (): Codec<Peer> => {
    return message<Peer>({
      0: { name: 'publicKey', codec: bytes },
      1: { name: 'addrs', codec: bytes, repeats: true }
    })
  }

  export const encode = (obj: Peer): Uint8ArrayList => {
    return encodeMessage(obj, Peer.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): Peer => {
    return decodeMessage(buf, Peer.codec())
  }
}

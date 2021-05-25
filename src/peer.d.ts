import * as $protobuf from "protobufjs";
/** Properties of a Peer. */
export interface IPeer {

    /** Peer publicKey */
    publicKey: Uint8Array;

    /** Peer addrs */
    addrs?: (Uint8Array[]|null);
}

/** Represents a Peer. */
export class Peer implements IPeer {

    /**
     * Constructs a new Peer.
     * @param [p] Properties to set
     */
    constructor(p?: IPeer);

    /** Peer publicKey. */
    public publicKey: Uint8Array;

    /** Peer addrs. */
    public addrs: Uint8Array[];

    /**
     * Encodes the specified Peer message. Does not implicitly {@link Peer.verify|verify} messages.
     * @param m Peer message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(m: IPeer, w?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Peer message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns Peer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): Peer;

    /**
     * Creates a Peer message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns Peer
     */
    public static fromObject(d: { [k: string]: any }): Peer;

    /**
     * Creates a plain object from a Peer message. Also converts values to other types if specified.
     * @param m Peer
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(m: Peer, o?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Peer to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/*eslint-disable*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["libp2p-pubsub-discovery"] || ($protobuf.roots["libp2p-pubsub-discovery"] = {});

export const Peer = $root.Peer = (() => {

    /**
     * Properties of a Peer.
     * @exports IPeer
     * @interface IPeer
     * @property {Uint8Array} publicKey Peer publicKey
     * @property {Array.<Uint8Array>|null} [addrs] Peer addrs
     */

    /**
     * Constructs a new Peer.
     * @exports Peer
     * @classdesc Represents a Peer.
     * @implements IPeer
     * @constructor
     * @param {IPeer=} [p] Properties to set
     */
    function Peer(p) {
        this.addrs = [];
        if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null)
                    this[ks[i]] = p[ks[i]];
    }

    /**
     * Peer publicKey.
     * @member {Uint8Array} publicKey
     * @memberof Peer
     * @instance
     */
    Peer.prototype.publicKey = $util.newBuffer([]);

    /**
     * Peer addrs.
     * @member {Array.<Uint8Array>} addrs
     * @memberof Peer
     * @instance
     */
    Peer.prototype.addrs = $util.emptyArray;

    /**
     * Encodes the specified Peer message. Does not implicitly {@link Peer.verify|verify} messages.
     * @function encode
     * @memberof Peer
     * @static
     * @param {IPeer} m Peer message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Peer.encode = function encode(m, w) {
        if (!w)
            w = $Writer.create();
        w.uint32(2).bytes(m.publicKey);
        if (m.addrs != null && m.addrs.length) {
            for (var i = 0; i < m.addrs.length; ++i)
                w.uint32(10).bytes(m.addrs[i]);
        }
        return w;
    };

    /**
     * Decodes a Peer message from the specified reader or buffer.
     * @function decode
     * @memberof Peer
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {Peer} Peer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Peer.decode = function decode(r, l) {
        if (!(r instanceof $Reader))
            r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l, m = new $root.Peer();
        while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
            case 0:
                m.publicKey = r.bytes();
                break;
            case 1:
                if (!(m.addrs && m.addrs.length))
                    m.addrs = [];
                m.addrs.push(r.bytes());
                break;
            default:
                r.skipType(t & 7);
                break;
            }
        }
        if (!m.hasOwnProperty("publicKey"))
            throw $util.ProtocolError("missing required 'publicKey'", { instance: m });
        return m;
    };

    /**
     * Creates a Peer message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Peer
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {Peer} Peer
     */
    Peer.fromObject = function fromObject(d) {
        if (d instanceof $root.Peer)
            return d;
        var m = new $root.Peer();
        if (d.publicKey != null) {
            if (typeof d.publicKey === "string")
                $util.base64.decode(d.publicKey, m.publicKey = $util.newBuffer($util.base64.length(d.publicKey)), 0);
            else if (d.publicKey.length)
                m.publicKey = d.publicKey;
        }
        if (d.addrs) {
            if (!Array.isArray(d.addrs))
                throw TypeError(".Peer.addrs: array expected");
            m.addrs = [];
            for (var i = 0; i < d.addrs.length; ++i) {
                if (typeof d.addrs[i] === "string")
                    $util.base64.decode(d.addrs[i], m.addrs[i] = $util.newBuffer($util.base64.length(d.addrs[i])), 0);
                else if (d.addrs[i].length)
                    m.addrs[i] = d.addrs[i];
            }
        }
        return m;
    };

    /**
     * Creates a plain object from a Peer message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Peer
     * @static
     * @param {Peer} m Peer
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Peer.toObject = function toObject(m, o) {
        if (!o)
            o = {};
        var d = {};
        if (o.arrays || o.defaults) {
            d.addrs = [];
        }
        if (o.defaults) {
            if (o.bytes === String)
                d.publicKey = "";
            else {
                d.publicKey = [];
                if (o.bytes !== Array)
                    d.publicKey = $util.newBuffer(d.publicKey);
            }
        }
        if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
            d.publicKey = o.bytes === String ? $util.base64.encode(m.publicKey, 0, m.publicKey.length) : o.bytes === Array ? Array.prototype.slice.call(m.publicKey) : m.publicKey;
        }
        if (m.addrs && m.addrs.length) {
            d.addrs = [];
            for (var j = 0; j < m.addrs.length; ++j) {
                d.addrs[j] = o.bytes === String ? $util.base64.encode(m.addrs[j], 0, m.addrs[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.addrs[j]) : m.addrs[j];
            }
        }
        return d;
    };

    /**
     * Converts this Peer to JSON.
     * @function toJSON
     * @memberof Peer
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Peer.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Peer;
})();

export { $root as default };

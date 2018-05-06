/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { READ, CALL, CONSTRUCT } = require("./reference-tracer")

module.exports = {
    modules: {
        _linklist: {
            [READ]: {
                since: 5,
                replacedBy: null,
            },
        },
        //eslint-disable-next-line camelcase
        async_hooks: {
            currentId: {
                [READ]: {
                    since: 8.2,
                    replacedBy: "'async_hooks.executionAsyncId()'",
                },
            },
            triggerId: {
                [READ]: {
                    since: 8.2,
                    replacedBy: "'async_hooks.triggerAsyncId()'",
                },
            },
        },
        buffer: {
            Buffer: {
                [CONSTRUCT]: {
                    since: 6,
                    replacedBy:
                        "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()' (use 'https://www.npmjs.com/package/safe-buffer' for '<4.5.0')",
                },
                [CALL]: {
                    since: 6,
                    replacedBy:
                        "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()' (use 'https://www.npmjs.com/package/safe-buffer' for '<4.5.0')",
                },
            },
            SlowBuffer: {
                [READ]: {
                    since: 6,
                    replacedBy: "'buffer.Buffer.allocUnsafeSlow()'",
                },
            },
        },
        constants: {
            [READ]: {
                since: 6.3,
                replacedBy: "'constants' property of each module",
            },
        },
        crypto: {
            Credentials: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'tls.SecureContext'",
                },
            },
            createCredentials: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'tls.createSecureContext()'",
                },
            },
        },
        domain: {
            [READ]: {
                since: 4,
                replacedBy: null,
            },
        },
        events: {
            EventEmitter: {
                listenerCount: {
                    [READ]: {
                        since: 4,
                        replacedBy: "'events.EventEmitter#listenerCount()'",
                    },
                },
            },
            listenerCount: {
                [READ]: {
                    since: 4,
                    replacedBy: "'events.EventEmitter#listenerCount()'",
                },
            },
        },
        freelist: {
            [READ]: {
                since: 4,
                replacedBy: null,
            },
        },
        fs: {
            SyncWriteStream: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            exists: {
                [READ]: {
                    since: 4,
                    replacedBy: "'fs.stat()' or 'fs.access()'",
                },
            },
            lchmod: {
                [READ]: {
                    since: 0.4,
                    replacedBy: null,
                },
            },
            lchmodSync: {
                [READ]: {
                    since: 0.4,
                    replacedBy: null,
                },
            },
            lchown: {
                [READ]: {
                    since: 0.4,
                    replacedBy: null,
                },
            },
            lchownSync: {
                [READ]: {
                    since: 0.4,
                    replacedBy: null,
                },
            },
        },
        http: {
            createClient: {
                [READ]: {
                    since: 0.1,
                    replacedBy: "'http.request()'",
                },
            },
        },
        module: {
            Module: {
                requireRepl: {
                    [READ]: {
                        since: 6,
                        replacedBy: "'require(\"repl\")'",
                    },
                },
                _debug: {
                    [READ]: {
                        since: 9,
                        replacedBy: null,
                    },
                },
            },
            requireRepl: {
                [READ]: {
                    since: 6,
                    replacedBy: "'require(\"repl\")'",
                },
            },
            _debug: {
                [READ]: {
                    since: 9,
                    replacedBy: null,
                },
            },
        },
        os: {
            getNetworkInterfaces: {
                [READ]: {
                    since: 0.6,
                    replacedBy: "'os.networkInterfaces()'",
                },
            },
            tmpDir: {
                [READ]: {
                    since: 7,
                    replacedBy: "'os.tmpdir()'",
                },
            },
        },
        path: {
            _makeLong: {
                [READ]: {
                    since: 9,
                    replacedBy: "'path.toNamespacedPath()'",
                },
            },
        },
        punycode: {
            [READ]: {
                since: 7,
                replacedBy: "'https://www.npmjs.com/package/punycode'",
            },
        },
        readline: {
            codePointAt: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            getStringWidth: {
                [READ]: {
                    since: 6,
                    replacedBy: null,
                },
            },
            isFullWidthCodePoint: {
                [READ]: {
                    since: 6,
                    replacedBy: null,
                },
            },
            stripVTControlCharacters: {
                [READ]: {
                    since: 6,
                    replacedBy: null,
                },
            },
        },
        // safe-buffer.Buffer function/constructror is just a re-export of buffer.Buffer
        // and should be deprecated likewise.
        "safe-buffer": {
            Buffer: {
                [CONSTRUCT]: {
                    since: 6,
                    replacedBy:
                        "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
                },
                [CALL]: {
                    since: 6,
                    replacedBy:
                        "'buffer.Buffer.alloc()' or 'buffer.Buffer.from()'",
                },
            },
            SlowBuffer: {
                [READ]: {
                    since: 6,
                    replacedBy: "'buffer.Buffer.allocUnsafeSlow()'",
                },
            },
        },
        sys: {
            [READ]: {
                since: 0.3,
                replacedBy: "'util' module",
            },
        },
        tls: {
            CleartextStream: {
                [READ]: {
                    since: 0.1,
                    replacedBy: null,
                },
            },
            CryptoStream: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'tls.TLSSocket'",
                },
            },
            SecurePair: {
                [READ]: {
                    since: 6,
                    replacedBy: "'tls.TLSSocket'",
                },
            },
            createSecurePair: {
                [READ]: {
                    since: 6,
                    replacedBy: "'tls.TLSSocket'",
                },
            },
            parseCertString: {
                [READ]: {
                    since: 8.6,
                    replacedBy: "'querystring.parse()'",
                },
            },
        },
        tty: {
            setRawMode: {
                [READ]: {
                    since: 0.1,
                    replacedBy:
                        "'tty.ReadStream#setRawMode()' (e.g. 'process.stdin.setRawMode()')",
                },
            },
        },
        util: {
            debug: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'console.error()'",
                },
            },
            error: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'console.error()'",
                },
            },
            isArray: {
                [READ]: {
                    since: 4,
                    replacedBy: "'Array.isArray()'",
                },
            },
            isBoolean: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isBuffer: {
                [READ]: {
                    since: 4,
                    replacedBy: "'Buffer.isBuffer()'",
                },
            },
            isDate: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isError: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isFunction: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isNull: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isNullOrUndefined: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isNumber: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isObject: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isPrimitive: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isRegExp: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isString: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isSymbol: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            isUndefined: {
                [READ]: {
                    since: 4,
                    replacedBy: null,
                },
            },
            log: {
                [READ]: {
                    since: 6,
                    replacedBy: "a third party module",
                },
            },
            print: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'console.log()'",
                },
            },
            pump: {
                [READ]: {
                    since: 0.1,
                    replacedBy: "'stream.Readable#pipe()'",
                },
            },
            puts: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "'console.log()'",
                },
            },
            _extend: {
                [READ]: {
                    since: 6,
                    replacedBy: "'Object.assign()'",
                },
            },
        },
        vm: {
            runInDebugContext: {
                [READ]: {
                    since: 8,
                    replacedBy: null,
                },
            },
        },
    },
    globals: {
        Buffer: {
            [CONSTRUCT]: {
                since: 6,
                replacedBy:
                    "'Buffer.alloc()' or 'Buffer.from()' (use 'https://www.npmjs.com/package/safe-buffer' for '<4.5.0')",
            },
            [CALL]: {
                since: 6,
                replacedBy:
                    "'Buffer.alloc()' or 'Buffer.from()' (use 'https://www.npmjs.com/package/safe-buffer' for '<4.5.0')",
            },
        },
        GLOBAL: {
            [READ]: {
                since: 6,
                replacedBy: "'global'",
            },
        },
        Intl: {
            v8BreakIterator: {
                [READ]: {
                    since: 7,
                    replacedBy: null,
                },
            },
        },
        require: {
            extensions: {
                [READ]: {
                    since: 0.12,
                    replacedBy: "compiling them ahead of time",
                },
            },
        },
        root: {
            [READ]: {
                since: 6,
                replacedBy: "'global'",
            },
        },
        process: {
            EventEmitter: {
                [READ]: {
                    since: 0.6,
                    replacedBy: "'require(\"events\")'",
                },
            },
            env: {
                NODE_REPL_HISTORY_FILE: {
                    [READ]: {
                        since: 4,
                        replacedBy: "'NODE_REPL_HISTORY'",
                    },
                },
            },
        },
    },
}

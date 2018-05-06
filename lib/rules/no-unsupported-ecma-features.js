/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const semver = require("semver")
const esRules = require("eslint-plugin-es").rules
const features = require("../util/ecma-features")
const getInnermostScope = require("../util/get-innermost-scope")
const getPackageJson = require("../util/get-package-json")
const ReferenceTracer = require("../util/reference-tracer")

const VERSION_MAP = new Map([
    [0.1, "0.10.0"],
    [0.12, "0.12.0"],
    [4, "4.0.0"],
    [5, "5.0.0"],
    [6, "6.0.0"],
    [6.5, "6.5.0"],
    [7, "7.0.0"],
    [7.6, "7.6.0"],
    [8, "8.0.0"],
    [8.3, "8.3.0"],
    [9, "9.0.0"],
    [10, "10.0.0"],
])
const VERSION_SCHEMA = {
    anyOf: [
        { enum: Array.from(VERSION_MAP.keys()) },
        {
            type: "string",
            pattern: "^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$",
        },
    ],
}
const DEFAULT_VERSION = "6.0.0"
const OPTIONS = Object.keys(features)
const CLASS_TYPE = /^Class(?:Declaration|Expression)$/
const GET_OR_SET = /^(?:g|s)et$/
const READ = ReferenceTracer.READ
const GLOBALS = {
    Object: {
        assign: { [READ]: true },
        is: { [READ]: true },
        getOwnPropertySymbols: { [READ]: true },
        setPrototypeOf: { [READ]: true },
        values: { [READ]: true },
        entries: { [READ]: true },
        getOwnPropertyDescriptors: { [READ]: true },
    },
    Boolean: { [READ]: true },
    Number: {
        [READ]: true,
        isFinite: { [READ]: true },
        isInteger: { [READ]: true },
        isSafeInteger: { [READ]: true },
        isNaN: { [READ]: true },
        EPSILON: { [READ]: true },
        MIN_SAFE_INTEGER: { [READ]: true },
        MAX_SAFE_INTEGER: { [READ]: true },
    },
    String: {
        [READ]: true,
        raw: { [READ]: true },
        fromCodePoint: { [READ]: true },
    },
    Array: {
        [READ]: true,
        from: { [READ]: true },
        of: { [READ]: true },
    },
    Function: { [READ]: true },
    RegExp: { [READ]: true },
    Math: {
        clz32: { [READ]: true },
        imul: { [READ]: true },
        sign: { [READ]: true },
        log10: { [READ]: true },
        log2: { [READ]: true },
        log1p: { [READ]: true },
        expm1: { [READ]: true },
        cosh: { [READ]: true },
        sinh: { [READ]: true },
        tanh: { [READ]: true },
        acosh: { [READ]: true },
        asinh: { [READ]: true },
        atanh: { [READ]: true },
        trunc: { [READ]: true },
        fround: { [READ]: true },
        cbrt: { [READ]: true },
        hypot: { [READ]: true },
    },
    Int8Array: { [READ]: true },
    Uint8Array: { [READ]: true },
    Uint8ClampedArray: { [READ]: true },
    Int16Array: { [READ]: true },
    Uint16Array: { [READ]: true },
    Int32Array: { [READ]: true },
    Uint32Array: { [READ]: true },
    Float32Array: { [READ]: true },
    Float64Array: { [READ]: true },
    DataView: { [READ]: true },
    Map: { [READ]: true },
    Set: { [READ]: true },
    WeakMap: { [READ]: true },
    WeakSet: { [READ]: true },
    Proxy: { [READ]: true },
    Reflect: { [READ]: true },
    Promise: { [READ]: true },
    Symbol: {
        [READ]: true,
        hasInstance: { [READ]: true },
        isConcatSpreadablec: { [READ]: true },
        iterator: { [READ]: true },
        species: { [READ]: true },
        replace: { [READ]: true },
        search: { [READ]: true },
        split: { [READ]: true },
        match: { [READ]: true },
        toPrimitive: { [READ]: true },
        toStringTag: { [READ]: true },
        unscopables: { [READ]: true },
    },
    SharedArrayBuffer: { [READ]: true },
    Atomics: {
        [READ]: true,
        add: { [READ]: true },
        and: { [READ]: true },
        compareExchange: { [READ]: true },
        exchange: { [READ]: true },
        wait: { [READ]: true },
        wake: { [READ]: true },
        isLockFree: { [READ]: true },
        load: { [READ]: true },
        or: { [READ]: true },
        store: { [READ]: true },
        sub: { [READ]: true },
        xor: { [READ]: true },
    },
}
const SUBCLASSING_TEST_TARGETS = new Set([
    "Array",
    "RegExp",
    "Function",
    "Promise",
    "Boolean",
    "Number",
    "String",
    "Map",
    "Set",
])
const ES_RULE_MAP = [
    // ES2015
    ["no-arrow-functions", "arrowFunctions"],
    ["no-binary-numeric-literals", "binaryNumberLiterals"],
    ["no-block-scoped-functions", "blockScopedFunctions"],
    ["no-block-scoped-variables", node => node.kind],
    ["no-classes", "classes"],
    ["no-computed-properties", "objectLiteralExtensions"],
    ["no-default-parameters", "defaultParameters"],
    ["no-destructuring", "destructuring"],
    ["no-for-of-loops", "forOf"],
    ["no-generators", "generatorFunctions"],
    ["no-modules", "modules"],
    ["no-new-target", "new.target"],
    ["no-object-super-properties", ""],
    ["no-octal-numeric-literals", "octalNumberLiterals"],
    [
        "no-property-shorthands",
        node =>
            node.shorthand && GET_OR_SET.test(node.key.name)
                ? "objectPropertyShorthandOfGetSet"
                : "objectLiteralExtensions",
    ],
    ["no-regexp-u-flag", "regexpU"],
    ["no-regexp-y-flag", "regexpY"],
    ["no-rest-parameters", "restParameters"],
    ["no-spread-elements", "spreadOperators"],
    ["no-template-literals", "templateStrings"],
    ["no-unicode-codepoint-escapes", "unicodeCodePointEscapes"],

    // ES2016
    ["no-exponential-operators", "exponentialOperators"],

    // ES2017
    ["no-async-functions", "asyncAwait"],
    ["no-trailing-function-commas", "trailingCommasInFunctions"],

    // ES2018
    [
        "no-async-iteration",
        node =>
            node.type === "ForOfStatement" ? "forAwaitOf" : "asyncGenerators",
    ],
    ["no-malformed-template-literals", "templateLiteralRevision"],
    ["no-regexp-lookbehind-assertions", "regexpLookbehind"],
    ["no-regexp-named-capture-groups", "regexpNamedCaptureGroups"],
    ["no-regexp-s-flag", "regexpS"],
    ["no-regexp-unicode-property-escapes", "regexpUnicodeProperties"],
    [
        "no-rest-spread-properties",
        node =>
            node.type.startsWith("Rest")
                ? "restProperties"
                : "spreadProperties",
    ],
]

/**
 * Gets default version configuration of this rule.
 *
 * This finds and reads 'package.json' file, then parses 'engines.node' field.
 * If it's nothing, this returns null.
 *
 * @param {string} filename - The file name of the current linting file.
 * @returns {string} The default version configuration.
 */
function getDefaultVersion(filename) {
    const info = getPackageJson(filename)
    const nodeVersion = info && info.engines && info.engines.node

    return semver.validRange(nodeVersion) || DEFAULT_VERSION
}

/**
 * Gets values of the `ignores` option.
 *
 * @returns {string[]} Values of the `ignores` option.
 */
function getIgnoresEnum() {
    return Object.keys(
        OPTIONS.reduce((retv, key) => {
            for (const alias of features[key].alias) {
                retv[alias] = true
            }
            retv[key] = true
            return retv
        }, Object.create(null))
    )
}

/**
 * Checks whether a given key should be ignored or not.
 *
 * @param {string} key - A key to check.
 * @param {string[]} ignores - An array of keys and aliases to be ignored.
 * @returns {boolean} `true` if the key should be ignored.
 */
function isIgnored(key, ignores) {
    return (
        ignores.indexOf(key) !== -1 ||
        features[key].alias.some(alias => ignores.indexOf(alias) !== -1)
    )
}

/**
 * Parses the options.
 *
 * @param {number|string|object|undefined} options - An option object to parse.
 * @param {number} defaultVersion - The default version to use if the version option was omitted.
 * @returns {object} Parsed value.
 */
function parseOptions(options, defaultVersion) {
    let version = null
    let range = null
    let ignores = []

    if (typeof options === "number") {
        version = VERSION_MAP.get(options)
    } else if (typeof options === "string") {
        version = options
    } else if (typeof options === "object") {
        version =
            typeof options.version === "number"
                ? VERSION_MAP.get(options.version)
                : options.version

        ignores = options.ignores || []
    }

    range = semver.validRange(version ? `>=${version}` : defaultVersion)
    if (!version) {
        version = defaultVersion
    }

    return Object.freeze({
        version,
        features: Object.freeze(
            OPTIONS.reduce((retv, key) => {
                const feature = features[key]

                if (isIgnored(key, ignores)) {
                    retv[key] = Object.freeze({
                        name: feature.name,
                        singular: Boolean(feature.singular),
                        supported: true,
                        supportedInStrict: true,
                    })
                } else if (typeof feature.node === "string") {
                    retv[key] = Object.freeze({
                        name: feature.name,
                        singular: Boolean(feature.singular),
                        supported: !semver.intersects(
                            range,
                            `<${feature.node}`
                        ),
                        supportedInStrict: !semver.intersects(
                            range,
                            `<${feature.node}`
                        ),
                    })
                } else {
                    retv[key] = Object.freeze({
                        name: feature.name,
                        singular: Boolean(feature.singular),
                        supported:
                            feature.node != null &&
                            feature.node.sloppy != null &&
                            !semver.intersects(
                                range,
                                `<${feature.node.sloppy}`
                            ),
                        supportedInStrict:
                            feature.node != null &&
                            feature.node.strict != null &&
                            !semver.intersects(
                                range,
                                `<${feature.node.strict}`
                            ),
                    })
                }

                return retv
            }, Object.create(null))
        ),
    })
}

/**
 * Merge two visitors.
 * @param {Visitor} x The visitor which is assigned.
 * @param {Visitor} y The visitor which is assigning.
 * @returns {Visitor} `x`.
 */
function merge(x, y) {
    for (const key of Object.keys(y)) {
        if (typeof x[key] === "function") {
            if (x[key]._fs == null) {
                const fs = [x[key], y[key]]
                x[key] = function(node) {
                    for (const f of this) {
                        f(node)
                    }
                }.bind(fs)
                x[key]._fs = fs
            } else {
                x[key]._fs.push(y[key])
            }
        } else {
            x[key] = y[key]
        }
    }
    return x
}

/**
 * Checks whether the given class extends from null or not.
 *
 * @param {ASTNode} node - The class node to check.
 * @returns {boolean} `true` if the class extends from null.
 */
function extendsNull(node) {
    return (
        node.superClass != null &&
        node.superClass.type === "Literal" &&
        node.superClass.value === null
    )
}

module.exports = {
    meta: {
        docs: {
            description:
                "disallow unsupported ECMAScript features on the specified version",
            category: "Possible Errors",
            recommended: true,
            url:
                "https://github.com/mysticatea/eslint-plugin-node/blob/v6.0.1/docs/rules/no-unsupported-ecma-features.md",
        },
        fixable: null,
        schema: [
            {
                anyOf: [
                    VERSION_SCHEMA.anyOf[0],
                    VERSION_SCHEMA.anyOf[1],
                    {
                        type: "object",
                        properties: {
                            version: VERSION_SCHEMA,
                            ignores: {
                                type: "array",
                                items: { enum: getIgnoresEnum() },
                                uniqueItems: true,
                            },
                        },
                        additionalProperties: false,
                    },
                ],
            },
        ],
    },
    create(context) {
        const supportInfo = parseOptions(
            context.options[0],
            getDefaultVersion(context.getFilename())
        )

        /**
         * Checks whether or not the current scope is strict mode.
         * @param {Node} node The node to check.
         * @returns {boolean} `true` if the current scope is strict mode. Otherwise `false`.
         */
        function isStrict(node) {
            const scope = getInnermostScope(context.getScope(), node.range[0])
            return scope.isStrict
        }

        /**
         * Reports a given node if the specified feature is not supported.
         *
         * @param {ASTNode} node - A node to be reported.
         * @param {string} key - A feature name to report.
         * @returns {void}
         */
        function report(node, key) {
            const version = supportInfo.version
            const feature = supportInfo.features[key]
            if (feature.supported) {
                return
            }

            if (!feature.supportedInStrict) {
                context.report({
                    node,
                    message:
                        "{{feature}} {{be}} not supported yet on Node {{version}}.",
                    data: {
                        feature: feature.name,
                        be: feature.singular ? "is" : "are",
                        version,
                    },
                })
            } else if (!isStrict(node)) {
                context.report({
                    node,
                    message:
                        "{{feature}} {{be}} not supported yet on Node {{version}}.",
                    data: {
                        feature: `${feature.name} in non-strict mode`,
                        be: feature.singular ? "is" : "are",
                        version,
                    },
                })
            }
        }

        /**
         * Override the context with a given key.
         * @param {string|function} key The error's key to report.
         * @returns {RuleContext} The overriden context.
         */
        function contextWith(key) {
            return Object.create(context, {
                report: {
                    value: function overriddenReport({ node }) {
                        if (typeof key === "function") {
                            report(node, key(node))
                        } else {
                            report(node, key)
                        }
                    },
                    configurable: true,
                    writable: true,
                },
            })
        }

        const visitor = ES_RULE_MAP.reduce(
            (v, [ruleId, key]) =>
                merge(v, esRules[ruleId].create(contextWith(key))),
            {}
        )

        return merge(visitor, {
            "Program:exit"() {
                const tracer = new ReferenceTracer(context.getScope())
                const ignore = new Set()

                for (const { node, path } of Array.from(
                    tracer.iterateGlobalReferences(GLOBALS)
                ).reverse()) {
                    const key = path.join(".")
                    const ignoreKey = `${path[0]}@${node.range[0]}`

                    if (key in features && !ignore.has(ignoreKey)) {
                        ignore.add(ignoreKey)
                        report(node, key)
                    }
                    if (
                        SUBCLASSING_TEST_TARGETS.has(key) &&
                        CLASS_TYPE.test(node.parent.type) &&
                        node.parent.superClass === node
                    ) {
                        report(node, `extends${key}`)
                    }
                }
            },

            "ClassDeclaration, ClassExpression"(node) {
                if (extendsNull(node)) {
                    report(node, "extendsNull")
                }
            },
        })
    },
}

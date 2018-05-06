/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

/**
 * Get the innermost scope which contains a given location.
 * @param {escope.Scope} initialScope The initial scope to search.
 * @param {number} location The location to search.
 * @returns {escope.Scope} The innermost scope.
 */
module.exports = function getInnermostScope(initialScope, location) {
    let scope = initialScope
    while (scope.childScopes.length !== 0) {
        for (const childScope of scope.childScopes) {
            const range = childScope.block.range

            if (range[0] <= location && location < range[1]) {
                scope = childScope
                break
            }
        }
    }
    return scope
}

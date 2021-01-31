/**
 * big credits to https://stackoverflow.com/a/41704827/6850723
 * This method of using "with" has big big advantages. You can:
 *   - Wrap code in a local scope and expose them appropriately without needing to parse it.
 *     So code like 'var bah = 0' in the global scope will be exposed correctly
 *   - Mutate immutable properties of window
 *   - Any reference to the window property can be intercepted, so 'location.href' can be intercepted
 *     even without the window part like: 'window.location.href'
 * The *only* disadvantage is it is ES6 and it violates ES5 strict mode.
 * There is one weakness to this near-perfect setup, however, and that is
 * creating a function and returning its "this." Doing so will expose the real
 * window object and immutable objects like window.location
 */
const invalidWindowPropRegex = /[^a-z_]/i;
const signatureJSRewrite = '/* begin pademelon js rewrite */';
function jsRewriter(jsCode: string, windowProp: string) {
    if (invalidWindowPropRegex.test(windowProp)) {
        throw new Error('Invalid windowProp ' + windowProp + '. Matches invalid regex ' + invalidWindowPropRegex);
    }
    if (jsCode.startsWith(signatureJSRewrite)) {
        return jsCode;
    }
    return (
        signatureJSRewrite +
        ` (function() { with(window.${windowProp}.scopeProxy) { ${jsCode} } }).bind(window.${windowProp}.modifiedWindow)();`
    );
}

export { jsRewriter, invalidWindowPropRegex };

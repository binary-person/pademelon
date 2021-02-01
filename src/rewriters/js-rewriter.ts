/**
 * big credits to https://stackoverflow.com/a/41704827/6850723
 * This method of using "with" has big big advantages. You can:
 *   - Wrap code in a local scope and expose them appropriately without needing to parse it.
 *     So code like 'var bah = 0' in the global scope will be exposed correctly
 *   - Mutate immutable properties of window
 *   - Any reference to the window property can be intercepted, so 'location.href' can be intercepted
 *     even without the window part like: 'window.location.href'
 * The only disadvantage is it is ES6, it violates ES5 strict mode, and function declarations are not
 * exposed correctly, forcing to withdraw wrapping everything in a scope, and binding this to the modifiedWindow
 * Sites that create a function and returning its "this" will expose the real
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
    return signatureJSRewrite + ` with(window.${windowProp}.scopeProxy) {\n${jsCode}\n}`;
}

export { jsRewriter, invalidWindowPropRegex };

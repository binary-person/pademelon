/**
 * credits to https://stackoverflow.com/a/41704827/6850723
 * This method of using "with" has big advantages. You can:
 *   - Wrap code in a local scope and expose them appropriately without needing to parse it.
 *     So code like 'var bah = 0' in the global scope will be exposed correctly
 *   - Mutate immutable properties of window
 *   - Any reference to the window property can be intercepted, so 'location.href' can be intercepted
 *     even without the window part like: 'window.location.href'
 * Disadvantages:
 *   - it is ES6
 *   - it violates ES5 strict mode
 *   - function declarations are not exposed correctly, so wrapping in a local
 *     scope will be unfeasible. However, we can have an eval runner that
 *     exposes its local scope and whenever another part of the website
 *     wants to access a global function variable, we can traverse through the
 *     chain of evals and add it to the window object if it exists
 *
 *
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
    return (
        signatureJSRewrite +
        ` window.pademelonInstance.funcLookupChain.push((function(){ with(window.${windowProp}.modifiedWindow) {\n${jsCode}\n} ` +
        'var alreadyLookedupFuncs = Object.create(null); return function globalizeFunction(funcName) { ' +
        'if (alreadyLookedupFuncs[funcName] !== undefined) return alreadyLookedupFuncs[funcName]; ' +
        'try { eval("window." + funcName + " = " + funcName); alreadyLookedupFuncs[funcName] = true } catch(e) {alreadyLookedupFuncs[funcName] = false} ' +
        'return alreadyLookedupFuncs[funcName]}; ' +
        `}).bind(window.${windowProp}.modifiedWindow)())`
    );
}

export { jsRewriter, invalidWindowPropRegex };

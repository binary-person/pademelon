/**
 * credits to https://stackoverflow.com/a/41704827/6850723
 * This method of using "with" has big advantages. You can:
 *   - Wrap code in a local scope and expose them appropriately without needing to parse it (note: not anymore, see below).
 *     So code like 'var bah = 0' in the global scope will be exposed correctly
 *   - Mutate immutable properties of window
 *   - Any reference to the window property can be intercepted, so 'location.href' can be intercepted
 *     even without the window part like: 'window.location.href'
 * Disadvantages:
 *   - it is ES6
 *   - it violates ES5 strict mode
 *   - function declarations are not exposed correctly, so wrapping in a local
 *     scope will be unfeasible. However, we can have an eval runner (or closure) that
 *     exposes its local scope and whenever another part of the website
 *     wants to access a global function variable, we can traverse through the
 *     chain of evals and add it to the window object if it exists
 *   - whenever we always return true in the 'has' trap, although it will expose
 *     global variables properly, it incorrectly outputs true for 'propdoesntexist' in modifiedWindow.
 *     However, we can use the eval expose variable method and it's a win win situation (rip heap memory though)
 *
 *
 * Sites that create a function and returning its "this" will expose the real
 * window object and immutable objects like window.location
 */
const invalidWindowPropRegex = /[^a-z_]/i;
const signatureJSRewrite = '/* begin pademelon js rewrite */';
function jsRewriter(jsCode: string, windowProp: string): string {
    if (invalidWindowPropRegex.test(windowProp)) {
        throw new TypeError('Invalid windowProp ' + windowProp + '. Matches invalid regex ' + invalidWindowPropRegex);
    }
    if (!jsCode || jsCode.startsWith(signatureJSRewrite)) {
        return jsCode;
    }
    const newline = /\n|\r/.test(jsCode) ? '\n' : '';
    return (
        signatureJSRewrite +
        ` window.pademelonInstance.varLookupChain.push((function(){ with(window.${windowProp}.modifiedWindow) {${newline}${jsCode}${newline}} ` +
        'var alreadyLookedupVars = Object.create(null); return function globalizeFunction(funcName) { ' +
        'if (alreadyLookedupVars[funcName] !== undefined) return alreadyLookedupVars[funcName]; ' +
        'try { eval("window." + funcName + " = " + funcName); alreadyLookedupVars[funcName] = true } catch(e) {alreadyLookedupVars[funcName] = false} ' +
        'return alreadyLookedupVars[funcName]}; ' +
        `}).bind(this === window ? window.${windowProp}.modifiedWindow : this)())`
    );
}

export { jsRewriter, invalidWindowPropRegex };

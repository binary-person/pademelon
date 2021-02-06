import { jsRewriter } from './js-rewriter';

const windowProp = 'pademelonInstance';
const unrewrittenJS = 'var testvar = "hello from test"';
const rewrittenJS =
    '/* begin pademelon js rewrite */ window.pademelonInstance.funcLookupChain.push((function(){ with(window.pademelonInstance.modifiedWindow) {\nvar testvar = "hello from test"\n} var alreadyLookedupFuncs = Object.create(null); return function globalizeFunction(funcName) { if (alreadyLookedupFuncs[funcName] !== undefined) return alreadyLookedupFuncs[funcName]; try { eval("window." + funcName + " = " + funcName); alreadyLookedupFuncs[funcName] = true } catch(e) {alreadyLookedupFuncs[funcName] = false} return alreadyLookedupFuncs[funcName]}; }).bind(window.pademelonInstance.modifiedWindow)())';

describe('js rewriter', () => {
    it('should rewrite js correctly', () => {
        expect(jsRewriter(unrewrittenJS, windowProp)).toEqual(rewrittenJS);
    });
    it('should not rewrite js given its already been rewritten', () => {
        expect(jsRewriter(jsRewriter(unrewrittenJS, windowProp), windowProp)).toEqual(rewrittenJS);
    });
    it('should throw given invalid windowProp', () => {
        expect(() => jsRewriter(unrewrittenJS, 'invalid-windowprop')).toThrowError('Invalid windowProp');
    });
});

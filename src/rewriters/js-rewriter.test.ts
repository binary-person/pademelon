import { jsRewriter } from './js-rewriter';

const windowProp = 'pademelonInstance';
const unrewrittenJS = 'var testvar = "hello from test"';
const rewrittenJS =
    '/* begin pademelon js rewrite */ with(window.pademelonInstance.modifiedWindow) {\nvar testvar = "hello from test"\n}';

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

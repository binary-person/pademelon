import { jsRewriter } from './js-rewriter';

const windowProp = 'pademelonInstance';
const unrewrittenJS = 'var testvar = "hello from test"';

describe('js rewriter', () => {
    it('should rewrite js with signature', () => {
        expect(jsRewriter(unrewrittenJS, windowProp).startsWith('/* begin pademelon js rewrite */')).toEqual(true);
    });
    it('should rewrite js in one line given jsCode does not have any new line character', () => {
        expect(jsRewriter(unrewrittenJS, windowProp).includes('\n')).toEqual(false);
    });
    it('should rewrite js with two extra \\n given jsCode includes a new line character', () => {
        expect(jsRewriter(unrewrittenJS + '\r', windowProp).match(/\n/g)?.length).toEqual(2);
    });
    it('should not rewrite js given its already been rewritten', () => {
        expect(jsRewriter(jsRewriter(unrewrittenJS, windowProp), windowProp)).toEqual(
            jsRewriter(unrewrittenJS, windowProp)
        );
    });
    it('should not rewrite if jsCode is falsy', () => {
        expect(jsRewriter('', windowProp)).toEqual('');
    });
    it('should throw given invalid windowProp', () => {
        expect(() => jsRewriter(unrewrittenJS, 'invalid-windowprop')).toThrowError('Invalid windowProp');
    });
});

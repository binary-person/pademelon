import { jsRewriter } from './js-rewriter';

describe('js rewriter', () => {
    it('should rewrite js correctly', () => {
        expect(jsRewriter('var testvar = "hello from test"', 'pademelonInstance')).toEqual(
            '(function() { with(window.pademelonInstance.scopeProxy) { var testvar = "hello from test" } }).bind(window.pademelonInstance.modifiedWindow)();',
        );
    });
});

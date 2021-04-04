import { workerJsRewriter } from './worker-js-rewriter';

describe('worker js rewriter', () => {
    it('rewrites correctly with signature', () => {
        expect(workerJsRewriter('someCode()', '/worker.js', JSON.stringify({ options: 123 }), 'prop')).toEqual(
            '/* begin pademelon worker js rewrite */ if (!self.prop) { importScripts(\'/worker.js\'); self.prop = new PademelonWorker({"options":123}); self.prop.init(); } someCode()'
        );
    });
    it('rewrites with newline given code has newline', () => {
        expect(
            workerJsRewriter('someCode();\nwithNewLine();', '/worker.js', JSON.stringify({ options: 123 }), 'prop')
        ).toEqual(
            '/* begin pademelon worker js rewrite */ if (!self.prop) { importScripts(\'/worker.js\'); self.prop = new PademelonWorker({"options":123}); self.prop.init(); }\nsomeCode();\nwithNewLine();'
        );
    });
    it('does not rewrite if signature already exists', () => {
        const alreadyRewritten = "/* begin pademelon worker js rewrite */ importScripts('/worker.js'); someCode()";
        expect(
            workerJsRewriter(alreadyRewritten, 'valuedoesntmatter', JSON.stringify({ doesntmatter: 123 }), 'prop')
        ).toEqual(alreadyRewritten);
    });
    it('does not rewrite if code is empty', () => {
        expect(workerJsRewriter('', 'valuedoesntmatter', '', '')).toEqual('');
    });
    it('throws error given invalid selfProp', () => {
        expect(() => workerJsRewriter('', '', '', 'ss*sss')).toThrowError('Invalid selfProp ss*sss');
    });
});

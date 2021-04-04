import { invalidWindowPropRegex } from './js-rewriter';

const signatureJSRewrite = '/* begin pademelon worker js rewrite */';
function workerJsRewriter(
    workerJsCode: string,
    pademelonWorkerPath: string,
    pademelonWorkerOptions: string,
    selfProp: string
): string {
    if (invalidWindowPropRegex.test(selfProp)) {
        throw new TypeError('Invalid selfProp ' + selfProp + '. Matches invalid regex ' + invalidWindowPropRegex);
    }
    if (!workerJsCode || workerJsCode.startsWith(signatureJSRewrite)) {
        return workerJsCode;
    }
    const newline = /\n|\r/.test(workerJsCode) ? '\n' : ' ';
    return (
        signatureJSRewrite +
        ` if (!self.${selfProp}) { importScripts('${pademelonWorkerPath}'); ` +
        `self.${selfProp} = new PademelonWorker(${pademelonWorkerOptions}); self.${selfProp}.init(); }${newline}${workerJsCode}`
    );
}

export { workerJsRewriter };
